import validator from "validator";
import { z } from "zod";

export const alumnusSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 10, "Invalid graduation year"),
  class: z.string().optional(),
  schoolSector: z.string().min(1, "School sector is required"),
  mail: z.string().refine((val) => validator.isEmail(val), {
    message: "Invalid email address",
  }),
  linkedInProfile: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  professionalStatus: z.string().optional(),
  schoolId: z.string().uuid("Invalid school ID").optional(),
});

export type AlumnusInput = z.infer<typeof alumnusSchema>;

export const bulkAlumnusSchema = z.array(alumnusSchema);
