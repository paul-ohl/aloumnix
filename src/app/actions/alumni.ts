"use server";

import { revalidatePath } from "next/cache";
import { AuthService } from "@/lib/auth/service";
import type { Alumnus } from "@/lib/db/entities";
import { createAlumni, createAlumnus } from "@/lib/services/AlumnusService";
import type { AlumnusInput } from "@/lib/validation/alumni";
import { alumnusSchema } from "@/lib/validation/alumni";

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
