"use server";

import { revalidatePath } from "next/cache";
import type { Alumnus } from "@/lib/db/entities";
import { createAlumni, createAlumnus } from "@/lib/services/AlumnusService";
import type { AlumnusInput } from "@/lib/validation/alumni";
import { alumnusSchema } from "@/lib/validation/alumni";

export async function createAlumnusAction(data: AlumnusInput) {
  const validated = alumnusSchema.safeParse(data);
  if (!validated.success) {
    return {
      error: "Validation failed",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const { schoolId, ...rest } = validated.data;
    await createAlumnus({
      ...rest,
      school: { id: schoolId } as Alumnus["school"],
    });
    revalidatePath("/alumni");
    return { success: true };
  } catch (err) {
    console.error("Error creating alumnus:", err);
    return { error: "Failed to create student. Please try again." };
  }
}

export async function bulkCreateAlumniAction(data: AlumnusInput[]) {
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
      const { schoolId, ...rest } = res.data;
      validatedData.push({
        ...rest,
        school: { id: schoolId } as Alumnus["school"],
      });
    }
  });

  if (errors.length > 0) {
    return { error: "Validation failed for some rows", rowErrors: errors };
  }

  try {
    await createAlumni(validatedData);
    revalidatePath("/alumni");
    return { success: true, count: validatedData.length };
  } catch (err) {
    console.error("Error bulk creating alumni:", err);
    return {
      error:
        "Failed to process bulk upload. Please check your data and try again.",
    };
  }
}
