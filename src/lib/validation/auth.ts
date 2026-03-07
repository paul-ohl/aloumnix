import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export function validatePassword(password: string) {
  if (process.env.NODE_ENV === "development") {
    if (!password || password.length < 1) {
      return "Password cannot be empty.";
    }
    return null;
  }

  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
}

export const requestOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  code: z
    .string()
    .length(6, "The code must be exactly 6 digits.")
    .regex(/^\d{6}$/, "The code must contain only digits."),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
