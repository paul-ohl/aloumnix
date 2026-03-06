import { z } from "zod";

export const eventCreationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  datetime: z.string().min(1, "Date and time are required"),
  details: z.string().min(10, "Details must be at least 10 characters"),
  schoolId: z.string().uuid("Invalid school ID"),
});

export type EventCreationInput = z.infer<typeof eventCreationSchema>;
