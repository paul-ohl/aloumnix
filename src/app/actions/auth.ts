"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/lib/auth/service";
import { getDataSource } from "@/lib/db/data-source";
import { Alumnus, School } from "@/lib/db/entities";

/**
 * State for Authentication Actions
 */
export type AuthState = {
  error: string | null;
};

/**
 * Action for School Login
 */
export async function loginSchoolAction(
  prevState: AuthState | undefined,
  formData: FormData,
): Promise<AuthState | undefined> {
  const schoolId = formData.get("schoolId") as string;
  const password = formData.get("password") as string;

  if (!schoolId) {
    return { error: "Please select a school." };
  }

  try {
    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(School);
    const school = await repository.findOne({ where: { id: schoolId } });

    if (!school) {
      return { error: "School not found." };
    }

    if (school.isPasswordSet && school.password) {
      if (!password) {
        return { error: "Please enter your password." };
      }
      const isValid = await AuthService.verifyPassword(
        password,
        school.password,
      );
      if (!isValid) {
        return { error: "Invalid password." };
      }
    } else {
      // First login
      if (password) {
        return {
          error: "First login must be without password. Please leave it empty.",
        };
      }
    }

    const session = await AuthService.createSession(school, "school");

    if (session.needsPasswordSet) {
      redirect("/set-password");
    }

    redirect("/school/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Action for Alumni Login
 */
export async function loginAlumniAction(
  prevState: AuthState | undefined,
  formData: FormData,
): Promise<AuthState | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email) {
    return { error: "Please enter your email." };
  }

  try {
    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Alumnus);
    const alumnus = await repository.findOne({ where: { mail: email } });

    if (!alumnus) {
      return { error: "Invalid email or password." };
    }

    if (alumnus.isPasswordSet && alumnus.password) {
      if (!password) {
        return { error: "Please enter your password." };
      }
      const isValid = await AuthService.verifyPassword(
        password,
        alumnus.password,
      );
      if (!isValid) {
        return { error: "Invalid email or password." };
      }
    } else {
      // First login
      if (password) {
        return {
          error: "First login must be without password. Please leave it empty.",
        };
      }
    }

    const session = await AuthService.createSession(alumnus, "alumnus");

    if (session.needsPasswordSet) {
      redirect("/set-password");
    }

    redirect("/alumni/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Action for Setting Password (First Login)
 */
export async function setPasswordAction(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return;
  }

  if (password !== confirmPassword) {
    return;
  }

  const session = await AuthService.getSession();
  if (!session) {
    redirect("/login/alumni");
  }

  const dataSource = await getDataSource();
  const hashedPassword = await AuthService.hashPassword(password);

  if (session.role === "school") {
    const repository = dataSource.getRepository(School);
    await repository.update(session.userId, {
      password: hashedPassword,
      isPasswordSet: true,
    });
    // Refresh session
    const school = await repository.findOne({ where: { id: session.userId } });
    if (school) await AuthService.createSession(school, "school");
    redirect("/school/dashboard");
  } else {
    const repository = dataSource.getRepository(Alumnus);
    await repository.update(session.userId, {
      password: hashedPassword,
      isPasswordSet: true,
    });
    // Refresh session
    const alumnus = await repository.findOne({ where: { id: session.userId } });
    if (alumnus) await AuthService.createSession(alumnus, "alumnus");
    redirect("/alumni/dashboard");
  }
}

/**
 * Action for Logout
 */
export async function logoutAction(): Promise<void> {
  await AuthService.logout();
  redirect("/login/alumni");
}
