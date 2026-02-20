"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/lib/auth/service";
import { getDataSource } from "@/lib/db/data-source";
import { Alumnus, School } from "@/lib/db/entities";
import { validatePassword } from "@/lib/validation/auth";

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

/**
 * Action for Alumni Login
 */
export async function loginAlumniAction(
  _prevState: AuthState | undefined,
  formData: FormData,
): Promise<AuthState | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  let redirectPath: string | null = null;

  if (!email) {
    return { error: "Please enter your email." };
  }

  try {
    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Alumnus);
    const alumnus = await repository.findOne({ where: { mail: email } });

    if (!alumnus) {
      return { error: "Invalid email or password.", email };
    }

    if (alumnus.isPasswordSet && alumnus.password) {
      if (!password) {
        return { error: "Please enter your password.", email };
      }
      const isValid = await AuthService.verifyPassword(
        password,
        alumnus.password,
      );
      if (!isValid) {
        return { error: "Invalid email or password.", email };
      }
    } else {
      // First login
      if (password) {
        return {
          error: "First login must be without password. Please leave it empty.",
          email,
        };
      }
    }

    const session = await AuthService.createSession(alumnus, "alumnus");
    redirectPath = session.needsPasswordSet
      ? "/set-password"
      : "/alumni/dashboard";
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "An unexpected error occurred. Please try again.",
      email,
    };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

/**
 * Action for Setting Password (First Login)
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
      redirectPath = "/login/alumni";
    } else {
      const dataSource = await getDataSource();
      const hashedPassword = await AuthService.hashPassword(password);

      if (session.role === "school") {
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
      } else {
        const repository = dataSource.getRepository(Alumnus);
        await repository.update(session.userId, {
          password: hashedPassword,
          isPasswordSet: true,
        });
        // Refresh session
        const alumnus = await repository.findOne({
          where: { id: session.userId },
        });
        if (alumnus) await AuthService.createSession(alumnus, "alumnus");
        redirectPath = "/alumni/dashboard";
      }
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
