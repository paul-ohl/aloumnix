"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/lib/auth/service";
import { getDataSource } from "@/lib/db/data-source";
import { Alumnus, AlumnusOtp, School } from "@/lib/db/entities";
import { EmailService } from "@/lib/services/EmailService";
import {
  requestOtpSchema,
  validatePassword,
  verifyOtpSchema,
} from "@/lib/validation/auth";

/**
 * State for Authentication Actions
 */
export type AuthState = {
  error: string | null;
  email?: string;
  schoolId?: string;
  success?: boolean;
};

/**
 * Action for School Login
 */
export async function loginSchoolAction(
  _prevState: AuthState | undefined,
  formData: FormData,
): Promise<AuthState | undefined> {
  const schoolId = formData.get("schoolId") as string;
  const password = formData.get("password") as string;
  let redirectPath: string | null = null;

  if (!schoolId) {
    return { error: "Please select a school." };
  }

  try {
    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(School);
    const school = await repository.findOne({ where: { id: schoolId } });

    if (!school) {
      return { error: "School not found.", schoolId };
    }

    if (school.isPasswordSet && school.password) {
      if (!password) {
        return { error: "Please enter your password.", schoolId };
      }
      const isValid = await AuthService.verifyPassword(
        password,
        school.password,
      );
      if (!isValid) {
        return { error: "Invalid password.", schoolId };
      }
    } else {
      // First login
      if (password) {
        return {
          error: "First login must be without password. Please leave it empty.",
          schoolId,
        };
      }
    }

    const session = await AuthService.createSession(school, "school");
    redirectPath = session.needsPasswordSet
      ? "/set-password"
      : "/school/dashboard";
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "An unexpected error occurred. Please try again.",
      schoolId,
    };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

const OTP_EXPIRY_MINUTES = 10;

/**
 * Step 1 of alumni login: validate email, generate OTP, send it by email.
 */
export async function requestAlumniOtpAction(
  _prevState: AuthState | undefined,
  formData: FormData,
): Promise<AuthState | undefined> {
  const raw = { email: formData.get("email") as string };

  const validated = requestOtpSchema.safeParse(raw);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { email } = validated.data;

  try {
    const dataSource = await getDataSource();
    const alumnusRepo = dataSource.getRepository(Alumnus);
    const alumnus = await alumnusRepo.findOne({ where: { mail: email } });

    // Return success regardless of whether the email is registered, to avoid
    // leaking which addresses are in the database (enumeration attack prevention).
    if (!alumnus) {
      return { success: true, email, error: null };
    }

    // Invalidate any prior unused OTPs for this alumnus.
    const otpRepo = dataSource.getRepository(AlumnusOtp);
    await otpRepo.delete({ alumnus: { id: alumnus.id }, used: false });

    // Generate a 6-digit code in the full [000000, 999999] range.
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const otp = otpRepo.create({ alumnus, code, expiresAt, used: false });
    await otpRepo.save(otp);

    try {
      await EmailService.sendOtpEmail(
        { email: alumnus.mail, name: alumnus.fullName },
        code,
        OTP_EXPIRY_MINUTES,
      );
    } catch (emailError) {
      // Email failed — remove the OTP so it doesn't linger as an orphan.
      await otpRepo.delete(otp.id);
      throw emailError;
    }

    return { success: true, email, error: null };
  } catch (error) {
    console.error("requestAlumniOtpAction error:", error);
    return { error: "Failed to send login code. Please try again." };
  }
}

/**
 * Step 2 of alumni login: verify the OTP and create a session.
 */
export async function verifyAlumniOtpAction(
  _prevState: AuthState | undefined,
  formData: FormData,
): Promise<AuthState | undefined> {
  const raw = {
    email: formData.get("email") as string,
    code: formData.get("code") as string,
  };

  const validated = verifyOtpSchema.safeParse(raw);
  if (!validated.success) {
    return { error: validated.error.issues[0].message, email: raw.email };
  }

  const { email, code } = validated.data;

  // Validate redirect_to: must start with /alumni/ to prevent open redirect.
  const rawRedirectTo = formData.get("redirect_to") as string | null;
  const redirectTo = rawRedirectTo?.startsWith("/alumni/")
    ? rawRedirectTo
    : "/alumni/dashboard";

  let redirectPath: string | null = null;

  try {
    const dataSource = await getDataSource();
    const alumnusRepo = dataSource.getRepository(Alumnus);
    const alumnus = await alumnusRepo.findOne({ where: { mail: email } });

    if (!alumnus) {
      return { error: "Invalid or expired code.", email };
    }

    const otpRepo = dataSource.getRepository(AlumnusOtp);
    const otp = await otpRepo.findOne({
      where: { alumnus: { id: alumnus.id }, code, used: false },
      relations: ["alumnus"],
    });

    if (!otp || otp.expiresAt < new Date()) {
      if (otp) {
        // Expired — mark it as used to prevent retries
        await otpRepo.update(otp.id, { used: true });
      }
      return { error: "Invalid or expired code.", email };
    }

    await otpRepo.update(otp.id, { used: true });

    await AuthService.createSession(alumnus, "alumnus");
    redirectPath = redirectTo;
  } catch (error) {
    console.error("verifyAlumniOtpAction error:", error);
    return { error: "An unexpected error occurred. Please try again.", email };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

/**
 * Action for Setting Password (First Login — schools only)
 */
export async function setPasswordAction(
  _prevState: AuthState | undefined,
  formData: FormData,
): Promise<AuthState | undefined> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  let redirectPath: string | null = null;

  const validationError = validatePassword(password);
  if (validationError) {
    return { error: validationError };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const session = await AuthService.getSession();
    if (!session) {
      redirectPath = "/login/school";
    } else {
      const dataSource = await getDataSource();
      const hashedPassword = await AuthService.hashPassword(password);
      const repository = dataSource.getRepository(School);
      await repository.update(session.userId, {
        password: hashedPassword,
        isPasswordSet: true,
      });
      // Refresh session
      const school = await repository.findOne({
        where: { id: session.userId },
      });
      if (school) await AuthService.createSession(school, "school");
      redirectPath = "/school/dashboard";
    }
  } catch (error) {
    console.error("Set password error:", error);
    return { error: "Failed to set password. Please try again." };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

/**
 * Action for Logout
 */
export async function logoutAction(): Promise<void> {
  await AuthService.logout();
  redirect("/login/alumni");
}
