"use server";

import { revalidatePath } from "next/cache";
import { AuthService } from "@/lib/auth/service";
import type { Alumnus } from "@/lib/db/entities";
import {
  type AlumnusFilters,
  createAlumni,
  createAlumnus,
  deleteAlumnus,
  getAlumni,
  getAlumnusById,
  getUniqueGraduationYears,
  getUniqueSchoolSectors,
  updateAlumnus,
} from "@/lib/services/AlumnusService";
import type { AlumnusInput } from "@/lib/validation/alumni";
import { alumnusSchema } from "@/lib/validation/alumni";

export async function getAlumniAction(filters: AlumnusFilters = {}) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  try {
    const result = await getAlumni({
      ...filters,
      schoolId: session.userId,
    });

    // Plainify entities to avoid "Only plain objects..." error when passing to Client Components
    return {
      ...result,
      items: result.items.map((item) => ({
        id: item.id,
        fullName: item.fullName,
        graduationYear: item.graduationYear,
        class: item.class,
        schoolSector: item.schoolSector,
        mail: item.mail,
        linkedInProfile: item.linkedInProfile,
        professionalStatus: item.professionalStatus,
        school: { id: item.school?.id } as Alumnus["school"],
        createdAt: item.createdAt.toISOString() as unknown as Date,
        updatedAt: item.updatedAt.toISOString() as unknown as Date,
      })),
    };
  } catch (err) {
    console.error("Error fetching alumni:", err);
    return { error: "Failed to fetch students" };
  }
}

export async function getOwnProfileAction() {
  const session = await AuthService.getSession();
  if (!session || session.role !== "alumnus") {
    return { error: "Unauthorized" };
  }

  try {
    const alumnus = await getAlumnusById(session.userId);
    if (!alumnus) return { error: "Profile not found" };

    return {
      success: true,
      profile: {
        id: alumnus.id,
        fullName: alumnus.fullName,
        graduationYear: alumnus.graduationYear,
        class: alumnus.class,
        schoolSector: alumnus.schoolSector,
        mail: alumnus.mail,
        linkedInProfile: alumnus.linkedInProfile,
        professionalStatus: alumnus.professionalStatus,
        schoolName: alumnus.school?.name,
      },
    };
  } catch (err) {
    console.error("Error fetching own profile:", err);
    return { error: "Failed to fetch profile" };
  }
}

export async function updateOwnProfileAction(data: {
  mail: string;
  linkedInProfile?: string;
  professionalStatus?: string;
}) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "alumnus") {
    return { error: "Unauthorized" };
  }

  try {
    const result = await updateAlumnus(session.userId, data);
    if (!result) return { error: "Profile not found" };

    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error updating own profile:", err);
    return { error: "Failed to update profile" };
  }
}

export async function getUniqueSchoolSectorsAction() {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  try {
    const sectors = await getUniqueSchoolSectors(session.userId);
    return { sectors };
  } catch (err) {
    console.error("Error fetching school sectors:", err);
    return { error: "Failed to fetch sectors" };
  }
}

export async function getUniqueGraduationYearsAction() {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  try {
    const years = await getUniqueGraduationYears(session.userId);
    return { years };
  } catch (err) {
    console.error("Error fetching graduation years:", err);
    return { error: "Failed to fetch years" };
  }
}

export async function createAlumnusAction(data: AlumnusInput) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const validated = alumnusSchema.safeParse(data);
  if (!validated.success) {
    return {
      error: "Validation failed",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const { schoolId: _unused, ...rest } = validated.data;
    await createAlumnus({
      ...rest,
      school: { id: session.userId } as Alumnus["school"],
    });
    revalidatePath("/school/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error creating alumnus:", err);
    return { error: "Failed to create student. Please try again." };
  }
}

export async function bulkCreateAlumniAction(data: AlumnusInput[]) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const errors: { index: number; errors: Record<string, string[]> }[] = [];
  const validatedData: Partial<Alumnus>[] = [];

  data.forEach((item, index) => {
    const res = alumnusSchema.safeParse(item);
    if (!res.success) {
      errors.push({
        index: index + 1,
        errors: res.error.flatten().fieldErrors,
      });
    } else {
      const { schoolId: _unused, ...rest } = res.data;
      validatedData.push({
        ...rest,
        school: { id: session.userId } as Alumnus["school"],
      });
    }
  });

  if (errors.length > 0) {
    return { error: "Validation failed for some rows", rowErrors: errors };
  }

  try {
    await createAlumni(validatedData);
    revalidatePath("/school/dashboard");
    return { success: true, count: validatedData.length };
  } catch (err) {
    console.error("Error bulk creating alumni:", err);
    return {
      error:
        "Failed to process bulk upload. Please check your data and try again.",
    };
  }
}

export async function updateAlumnusAction(id: string, data: AlumnusInput) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const validated = alumnusSchema.safeParse(data);
  if (!validated.success) {
    return {
      error: "Validation failed",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const { schoolId: _unused, ...rest } = validated.data;
    const result = await updateAlumnus(id, rest, session.userId);
    if (!result) return { error: "Student not found" };

    revalidatePath("/school/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error updating alumnus:", err);
    return { error: "Failed to update student" };
  }
}

export async function deleteAlumnusAction(id: string) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  try {
    const success = await deleteAlumnus(id, session.userId);
    if (!success) return { error: "Student not found" };

    revalidatePath("/school/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error deleting alumnus:", err);
    return { error: "Failed to delete student" };
  }
}

export async function deleteOwnAccountAction() {
  const session = await AuthService.getSession();
  if (!session || session.role !== "alumnus") {
    return { error: "Unauthorized" };
  }

  try {
    const success = await deleteAlumnus(session.userId);
    if (!success) return { error: "Account not found" };

    await AuthService.logout();
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error deleting own account:", err);
    return { error: "Failed to delete account. Please try again." };
  }
}
