"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createEventAction } from "@/app/actions/events";
import type { EventCreationInput } from "@/lib/validation/events";

interface EventCreationFormProps {
  schoolId: string;
}

export function EventCreationForm({ schoolId }: EventCreationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setError(null);
    setFieldErrors({});

    const data: EventCreationInput = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      datetime: formData.get("datetime") as string,
      details: formData.get("details") as string,
      schoolId: schoolId,
    };

    startTransition(async () => {
      const result = await createEventAction(data);
      if (result.error) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors as Record<string, string[]>);
        } else {
          setError(result.error);
        }
      } else {
        router.push("/school/dashboard?tab=events");
        router.refresh();
      }
    });
  }

  const inputClasses =
    "w-full px-4 py-2 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent outline-none transition-all text-zinc-900 placeholder:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500";
  const labelClasses =
    "block text-sm font-medium text-zinc-700 mb-1 dark:text-zinc-300";
  const errorClasses = "text-red-500 dark:text-red-400 text-xs mt-1";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Create Event
        </h2>
        <p className="text-zinc-500 text-sm dark:text-zinc-400">
          Fill in the details below to organize a new event for your alumni.
        </p>
      </header>

      <form onSubmit={onFormSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Event Name */}
          <div className="space-y-1">
            <label htmlFor="name" className={labelClasses}>
              Event Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g. Annual Alumni Reunion 2026"
              className={inputClasses}
            />
            {fieldErrors.name && (
              <p className={errorClasses}>{fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Location and Date/Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="location" className={labelClasses}>
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                placeholder="e.g. Grand Hall, City Center"
                className={inputClasses}
              />
              {fieldErrors.location && (
                <p className={errorClasses}>{fieldErrors.location[0]}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="datetime" className={labelClasses}>
                Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                id="datetime"
                name="datetime"
                required
                className={inputClasses}
              />
              {fieldErrors.datetime && (
                <p className={errorClasses}>{fieldErrors.datetime[0]}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <label htmlFor="details" className={labelClasses}>
              Details *
            </label>
            <textarea
              id="details"
              name="details"
              required
              rows={5}
              placeholder="Provide details about the event, agenda, dress code, etc."
              className={inputClasses}
            />
            {fieldErrors.details && (
              <p className={errorClasses}>{fieldErrors.details[0]}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm dark:bg-red-900/20 dark:border-red-900/30">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto px-8 py-3 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
