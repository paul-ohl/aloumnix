import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not defined in the environment variables.");
}

/**
 * Resend client singleton instance.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Helper to get the Resend client instance.
 * @returns The Resend client.
 */
export const getResendClient = () => resend;
