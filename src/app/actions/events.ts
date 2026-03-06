"use server";

import { revalidatePath } from "next/cache";
import { AuthService } from "@/lib/auth/service";
import type { School } from "@/lib/db/entities";
import {
  createEvent,
  deleteEvent,
  deleteEvents,
  type EventFilters,
  getEventById,
  getEvents,
  getEventsByIds,
  updateEvent,
} from "@/lib/services/EventService";
import {
  type EventCreationInput,
  eventCreationSchema,
} from "@/lib/validation/events";

export async function getEventsAction(filters: EventFilters = {}) {
  const session = await AuthService.getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await getEvents(filters);
    const serializedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      datetime: item.datetime.toISOString(),
      details: item.details,
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
    console.error("Failed to fetch events:", error);
    return { error: "Failed to fetch events" };
  }
}

export async function createEventAction(data: EventCreationInput) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const validatedFields = eventCreationSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: "Validation failed",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, location, datetime, details, schoolId } = validatedFields.data;

  if (schoolId !== session.userId) {
    return { error: "Unauthorized" };
  }

  try {
    await createEvent({
      name,
      location,
      datetime: new Date(datetime),
      details,
      school: { id: schoolId } as School,
    });

    revalidatePath("/school/dashboard");
    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { error: "Failed to create event" };
  }
}

export async function updateEventAction(id: string, data: EventCreationInput) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const validatedFields = eventCreationSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: "Validation failed",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, location, datetime, details, schoolId } = validatedFields.data;

  if (schoolId !== session.userId) {
    return { error: "Unauthorized" };
  }

  try {
    await updateEvent(id, {
      name,
      location,
      datetime: new Date(datetime),
      details,
    });

    revalidatePath("/school/dashboard");
    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update event:", error);
    return { error: "Failed to update event" };
  }
}

export async function deleteEventAction(id: string) {
  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  try {
    const event = await getEventById(id);

    if (!event) {
      return { error: "Event not found" };
    }

    if (event.school?.id !== session.userId) {
      return { error: "Unauthorized" };
    }

    await deleteEvent(id);

    revalidatePath("/school/dashboard");
    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { error: "Failed to delete event" };
  }
}

export async function deleteEventsAction(ids: string[]) {
  if (!ids.length) return { success: true };

  const session = await AuthService.getSession();
  if (!session || session.role !== "school") {
    return { error: "Unauthorized" };
  }

  const uniqueIds = [...new Set(ids)];

  try {
    const events = await getEventsByIds(uniqueIds);

    if (events.length !== uniqueIds.length) {
      return { error: "Some events were not found" };
    }

    const allOwnedBySchool = events.every(
      (event) => event.school?.id === session.userId,
    );
    if (!allOwnedBySchool) {
      return { error: "Unauthorized: You don't own some of these events" };
    }

    await deleteEvents(uniqueIds);

    revalidatePath("/school/dashboard");
    revalidatePath("/alumni/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete events:", error);
    return { error: "Failed to delete events" };
  }
}
