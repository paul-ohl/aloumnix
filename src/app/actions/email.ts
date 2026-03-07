"use server";

import { In } from "typeorm";
import { z } from "zod";
import { getDataSource } from "@/lib/db/data-source";
import { Alumnus, Event, JobOffering, School } from "@/lib/db/entities";
import { type AlumnusFilters, getAlumni } from "@/lib/services/AlumnusService";
import {
  type EmailData,
  type EmailRecipient,
  EmailService,
} from "@/lib/services/EmailService";

const sendEmailSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("general"),
    subject: z.string().min(1, { message: "Subject is required" }),
    message: z.string().min(1, { message: "Message is required" }),
    recipientIds: z.array(z.string()).optional(),
    filters: z.record(z.string(), z.any()).optional(),
    schoolId: z.string().min(1, { message: "School ID is required" }),
  }),
  z.object({
    type: z.literal("job"),
    jobId: z.string().min(1, { message: "Job selection is required" }),
    optionalMessage: z.string().optional(),
    recipientIds: z.array(z.string()).optional(),
    filters: z.record(z.string(), z.any()).optional(),
    schoolId: z.string().min(1, { message: "School ID is required" }),
  }),
  z.object({
    type: z.literal("event"),
    eventId: z.string().min(1, { message: "Event selection is required" }),
    optionalMessage: z.string().optional(),
    recipientIds: z.array(z.string()).optional(),
    filters: z.record(z.string(), z.any()).optional(),
    schoolId: z.string().min(1, { message: "School ID is required" }),
  }),
]);

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

export async function sendEmailAction(input: SendEmailInput) {
  const result = sendEmailSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e) => e.message).join(", "),
    };
  }

  const data = result.data;

  try {
    const dataSource = await getDataSource();
    const alumnusRepo = dataSource.getRepository(Alumnus);
    const schoolRepo = dataSource.getRepository(School);
    const jobRepo = dataSource.getRepository(JobOffering);
    const eventRepo = dataSource.getRepository(Event);

    // Get school name for the template
    const school = await schoolRepo.findOne({ where: { id: data.schoolId } });
    if (!school) {
      return { success: false, error: "School not found" };
    }

    let recipients: Alumnus[] = [];

    if (data.recipientIds && data.recipientIds.length > 0) {
      recipients = await alumnusRepo.find({
        where: { id: In(data.recipientIds), school: { id: data.schoolId } },
      });
    } else if (data.filters) {
      const filterResult = await getAlumni({
        ...(data.filters as AlumnusFilters),
        schoolId: data.schoolId,
        limit: 10000, // Reasonable limit for bulk email
      });
      recipients = filterResult.items;
    }

    if (recipients.length === 0) {
      return { success: false, error: "No recipients found" };
    }

    const emailRecipients: EmailRecipient[] = recipients.map((r) => ({
      email: r.mail,
      name: r.fullName,
    }));

    let emailData: EmailData;
    if (data.type === "general") {
      emailData = {
        type: "general",
        subject: data.subject,
        message: data.message,
        schoolName: school.name,
      };
    } else if (data.type === "job") {
      const job = await jobRepo.findOne({
        where: { id: data.jobId, school: { id: data.schoolId } },
      });

      if (!job) {
        return { success: false, error: "Job offering not found" };
      }

      const jobTitle = job.name;
      let companyName = school.name; // In our model, school is the one offering if it belongs to school
      let location = school.location; // Use school location if not specified in JobOffering
      const description = job.details;
      // Default: deep-link to the job in the alumni dashboard portal.
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      let applyUrl = `${appUrl}/alumni/dashboard?tab=jobs&highlight=${job.id}`;

      // Override with additional_info if present
      if (job.additional_info) {
        if (job.additional_info.companyName)
          companyName = job.additional_info.companyName as string;
        if (job.additional_info.location)
          location = job.additional_info.location as string;
        if (job.additional_info.applyUrl)
          applyUrl = job.additional_info.applyUrl as string;
      }

      if (!jobTitle || !companyName || !location || !description || !applyUrl) {
        return { success: false, error: "Missing job details" };
      }

      emailData = {
        type: "job",
        id: job.id,
        jobTitle,
        companyName,
        location,
        description,
        applyUrl,
        schoolName: school.name,
        optionalMessage: data.optionalMessage,
      };
    } else {
      // type === "event"
      const event = await eventRepo.findOne({
        where: { id: data.eventId, school: { id: data.schoolId } },
      });

      if (!event) {
        return { success: false, error: "Event not found" };
      }

      emailData = {
        type: "event",
        id: event.id,
        eventName: event.name,
        location: event.location,
        datetime: event.datetime.toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "short",
        }),
        details: event.details,
        schoolName: school.name,
        optionalMessage: data.optionalMessage,
      };
    }

    const emailResult = await EmailService.sendBulkEmail(
      emailRecipients,
      emailData,
    );

    return {
      success: emailResult.success,
      error: emailResult.success
        ? undefined
        : "Failed to send some or all emails",
    };
  } catch (error) {
    console.error("Error in sendEmailAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
