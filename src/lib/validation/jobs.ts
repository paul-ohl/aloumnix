import { z } from "zod";

export const jobCreationSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    schoolId: z.string().uuid("Invalid school ID"),
  })
  .catchall(z.string().optional());

export type JobCreationInput = z.infer<typeof jobCreationSchema>;
