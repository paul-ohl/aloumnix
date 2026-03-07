import { render } from "@react-email/render";
import { EventEmail } from "@/components/emails/EventEmail";
import { GeneralEmail } from "@/components/emails/GeneralEmail";
import { JobEmail } from "@/components/emails/JobEmail";
import { OtpEmail } from "@/components/emails/OtpEmail";
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
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  description: string;
  applyUrl: string;
  schoolName: string;
  optionalMessage?: string;
};

export type EventEmailData = {
  type: "event";
  id: string;
  eventName: string;
  location: string;
  datetime: string;
  details: string;
  schoolName: string;
  optionalMessage?: string;
};

export type EmailData = GeneralEmailData | JobEmailData | EventEmailData;

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
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // Link directly to the destination page; the auth guard will redirect to
      // /login/alumni?redirect_to=… if the recipient is not already logged in.
      let portalUrl: string;
      if (emailData.type === "event") {
        portalUrl = `${appUrl}/alumni/dashboard?tab=events&highlight=${emailData.id}`;
      } else if (emailData.type === "job") {
        portalUrl = `${appUrl}/alumni/dashboard?tab=jobs&highlight=${emailData.id}`;
      } else {
        portalUrl = `${appUrl}/alumni/dashboard`;
      }

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
                  portalUrl,
                }),
              );

              return {
                ...common,
                subject: emailData.subject,
                html,
              };
            }

            if (emailData.type === "event") {
              const html = await render(
                EventEmail({
                  eventName: emailData.eventName,
                  location: emailData.location,
                  datetime: emailData.datetime,
                  details: emailData.details,
                  schoolName: emailData.schoolName,
                  optionalMessage: emailData.optionalMessage,
                  portalUrl,
                }),
              );

              return {
                ...common,
                subject: `Upcoming Event: ${emailData.eventName}`,
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
                portalUrl,
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

  /**
   * Sends a one-time password code to a single alumnus email address.
   *
   * @param recipient Recipient email and display name
   * @param code      The 6-digit OTP code
   * @param expiresInMinutes How many minutes the code is valid for (shown in email body)
   */
  sendOtpEmail: async (
    recipient: EmailRecipient,
    code: string,
    expiresInMinutes: number,
  ) => {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY is not configured. Email service is unavailable.",
      );
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Aloumnix <onboarding@resend.dev>";

    const html = await render(
      OtpEmail({
        code,
        alumniName: recipient.name,
        expiresInMinutes,
      }),
    );

    return resend.emails.send({
      from: fromEmail,
      to: recipient.email,
      subject: "Your Aloumnix login code",
      html,
    });
  },
};
