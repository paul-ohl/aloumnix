"use server";

import { revalidatePath } from "next/cache";
import { AuthService } from "@/lib/auth/service";
import type { School } from "@/lib/db/entities";
import {
  createJob,
  getJobs,
  type JobFilters,
  updateJob,
} from "@/lib/services/JobService";
import {
  type JobCreationInput,
  jobCreationSchema,
} from "@/lib/validation/jobs";

export async function getJobsAction(filters: JobFilters = {}) {
  const session = await AuthService.getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await getJobs(filters);
    // Plain objects are required for Client Components
    const serializedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      details: item.details,
      additional_info: item.additional_info,
      school: item.school
        ? {
            id: item.school.id,
            name: item.school.name,
            location: item.school.location,
          }
        : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return {
      success: true,
      items: serializedItems,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return { error: "Failed to fetch job openings" };
  }
}

export async function seedJobsAction() {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const schoolId = session.userId;

  try {
    for (let i = 1; i <= 25; i++) {
      await createJob({
        name: `Test Job Opening #${i}`,
        details: `This is a detailed description for test job opening number ${i}. It was generated automatically to test pagination functionality.`,
        additional_info: {
          salary: `${Math.floor(Math.random() * 50 + 50)}k - ${Math.floor(Math.random() * 50 + 100)}k`,
          location: i % 2 === 0 ? "Remote" : "On-site",
          experience: `${(i % 5) + 1} years`,
        },
        school: { id: schoolId } as School,
      });
    }

    revalidatePath("/school/dashboard");
    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to seed jobs:", error);
    return { error: "Failed to seed test jobs" };
  }
}

export async function updateJobAction(id: string, data: JobCreationInput) {
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
    await updateJob(id, {
      name,
      details: description,
      additional_info: rest,
    });

    revalidatePath("/school/dashboard");
    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update job:", error);
    return { error: "Failed to update job opening" };
  }
}

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
