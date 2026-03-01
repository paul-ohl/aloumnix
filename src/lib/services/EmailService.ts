import { render } from "@react-email/render";
import { GeneralEmail } from "@/components/emails/GeneralEmail";
import { JobEmail } from "@/components/emails/JobEmail";
import { resend } from "@/lib/email/client";

export type EmailRecipient = {
  email: string;
  name: string;
};

export type GeneralEmailData = {
  type: "general";
  subject: string;
  message: string;
  schoolName: string;
};

export type JobEmailData = {
  type: "job";
  jobTitle: string;
  companyName: string;
  location: string;
  description: string;
  applyUrl: string;
  schoolName: string;
  optionalMessage?: string;
};

export type EmailData = GeneralEmailData | JobEmailData;

/**
 * Service to handle email operations using Resend.
 */
export const EmailService = {
  /**
   * Sends a bulk email to multiple recipients using Resend's Batch API.
   * Handles the 100-recipient batch limit.
   *
   * @param recipients List of recipients
   * @param emailData Data for the email template
   * @returns Object with success status and any errors
   */
  sendBulkEmail: async (recipients: EmailRecipient[], emailData: EmailData) => {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error(
          "RESEND_API_KEY is not configured. Email service is unavailable.",
        );
      }

      if (recipients.length === 0) {
        return { success: true, results: [] };
      }

      // Chunk recipients into batches of 100 (Resend Batch API limit)
      const batchSize = 100;
      const batches = [];
      for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
      }

      const results = [];
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Aloumnix <onboarding@resend.dev>";

      for (const batch of batches) {
        const emailBatch = await Promise.all(
          batch.map(async (recipient) => {
            const common = {
              from: fromEmail,
              to: recipient.email,
            };

            if (emailData.type === "general") {
              const html = await render(
                GeneralEmail({
                  subject: emailData.subject,
                  message: emailData.message,
                  schoolName: emailData.schoolName,
                }),
              );

              return {
                ...common,
                subject: emailData.subject,
                html,
              };
            }

            const html = await render(
              JobEmail({
                jobTitle: emailData.jobTitle,
                companyName: emailData.companyName,
                location: emailData.location,
                description: emailData.description,
                applyUrl: emailData.applyUrl,
                schoolName: emailData.schoolName,
                optionalMessage: emailData.optionalMessage,
              }),
            );

            return {
              ...common,
              subject: `Job Opportunity: ${emailData.jobTitle}`,
              html,
            };
          }),
        );

        const { data, error } = await resend.batch.send(emailBatch);

        if (error) {
          console.error("Resend batch send error:", error);
          results.push({ success: false, error });
        } else {
          results.push({ success: true, data });
        }

        // Resend rate limit is 2 requests per second.
        // We pause briefly if there are more batches.
        if (batches.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      const allSuccessful = results.every((r) => r.success);
      return {
        success: allSuccessful,
        results,
      };
    } catch (error) {
      console.error("EmailService.sendBulkEmail unexpected error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
