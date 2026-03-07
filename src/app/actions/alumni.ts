"use server";

import { revalidatePath } from "next/cache";
import { AuthService } from "@/lib/auth/service";
import type { Alumnus } from "@/lib/db/entities";
import {
  type AlumnusFilters,
  createAlumni,
  createAlumnus,
  getAlumni,
  getUniqueSchoolSectors,
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
