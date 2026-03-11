"use server";

import { revalidatePath } from "next/cache";
import { AuthService } from "@/lib/auth/service";
import type { School } from "@/lib/db/entities";
import {
  createJob,
  deleteJob,
  deleteJobs,
  getJobById,
  getJobs,
  getJobsByIds,
  getSchoolsWithJobs,
  getUniqueJobTypes,
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
      type: item.type,
      contactEmail: item.contactEmail,
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

export async function getUniqueJobTypesAction() {
  const session = await AuthService.getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const types = await getUniqueJobTypes();
    return { success: true, types };
  } catch (error) {
    console.error("Failed to fetch job types:", error);
    return { error: "Failed to fetch job types" };
  }
}

export async function getSchoolsWithJobsAction() {
  const session = await AuthService.getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const schools = await getSchoolsWithJobs();
    return {
      success: true,
      schools: schools.map((s) => ({ id: s.id, name: s.name })),
    };
  } catch (error) {
    console.error("Failed to fetch schools with jobs:", error);
    return { error: "Failed to fetch schools" };
  }
}

export async function seedJobsAction() {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const schoolId = session.userId;
  const jobTypes = ["CDI", "CDD", "Internship", "Freelance"];

  try {
    for (let i = 1; i <= 25; i++) {
      await createJob({
        name: `Test Job Opening #${i}`,
        type: jobTypes[i % jobTypes.length],
        contactEmail: "contact@example.com",
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

  const { name, type, contactEmail, description, schoolId, ...rest } =
    validatedFields.data;

  if (schoolId !== session.userId) {
    return { error: "Unauthorized" };
  }

  try {
    await updateJob(id, {
      name,
      type,
      contactEmail,
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

  const { name, type, contactEmail, description, schoolId, ...rest } =
    validatedFields.data;

  if (schoolId !== session.userId) {
    return { error: "Unauthorized" };
  }

  try {
    await createJob({
      name,
      type,
      contactEmail,
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

export async function deleteJobAction(id: string) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  try {
    const job = await getJobById(id);

    if (!job) {
      return { error: "Job opening not found" };
    }

    if (job.school?.id !== session.userId) {
      return { error: "Unauthorized" };
    }

    await deleteJob(id);

    revalidatePath("/school/dashboard");
    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete job:", error);
    return { error: "Failed to delete job opening" };
  }
}

export async function deleteJobsAction(ids: string[]) {
  if (!ids.length) return { success: true };

  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const uniqueIds = [...new Set(ids)];

  try {
    const jobs = await getJobsByIds(uniqueIds);

    if (jobs.length !== uniqueIds.length) {
      return { error: "Some job openings were not found" };
    }

    const allOwnedBySchool = jobs.every(
      (job) => job.school?.id === session.userId,
    );
    if (!allOwnedBySchool) {
      return {
        error: "Unauthorized: You don't own some of these job openings",
      };
    }

    await deleteJobs(uniqueIds);

    revalidatePath("/school/dashboard");
    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete jobs:", error);
    return { error: "Failed to delete job openings" };
  }
}
