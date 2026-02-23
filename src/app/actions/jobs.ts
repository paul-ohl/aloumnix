"use server";

import { revalidatePath } from "next/cache";
import { AuthService } from "@/lib/auth/service";
import type { School } from "@/lib/db/entities";
import { createJob } from "@/lib/services/JobService";
import {
  type JobCreationInput,
  jobCreationSchema,
} from "@/lib/validation/jobs";

export async function createJobAction(data: JobCreationInput) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const validatedFields = jobCreationSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: "Validation failed",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, description, schoolId, ...rest } = validatedFields.data;

  if (schoolId !== session.userId) {
    return { error: "Unauthorized" };
  }

  try {
    await createJob({
      name,
      details: description,
      additional_info: rest,
      school: { id: schoolId } as School,
    });

    revalidatePath("/school/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create job:", error);
    return { error: "Failed to create job opening" };
  }
}
