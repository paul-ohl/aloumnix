"use client";

import type { EventCreationInput } from "@/lib/validation/events";
import type { SerializedEvent } from "./types";

interface EventEditFormProps {
  event: SerializedEvent;
  onCancel: () => void;
  isUpdating: boolean;
  onSubmit: (data: EventCreationInput) => Promise<void>;
  updateError: string | null;
}

export function EventEditForm({
  event,
  onCancel,
  isUpdating,
  onSubmit,
  updateError,
}: EventEditFormProps) {
  // Convert ISO datetime string to local datetime-local input value
  const toDatetimeLocalValue = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: EventCreationInput = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      datetime: formData.get("datetime") as string,
      details: formData.get("details") as string,
      schoolId: event.school?.id || "",
    };
    await onSubmit(data);
  };

  const inputClasses =
    "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-50";
  const labelClasses =
    "block text-sm font-bold text-zinc-700 dark:text-zinc-300";

  return (
    <div className="space-y-6">
      <form id="edit-event-form" onSubmit={handleSubmit} className="space-y-6">
        {updateError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {updateError}
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="name" className={labelClasses}>
            Event Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={event.name}
            required
            className={inputClasses}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="location" className={labelClasses}>
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={event.location}
              required
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="datetime" className={labelClasses}>
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              id="datetime"
              name="datetime"
              defaultValue={toDatetimeLocalValue(event.datetime)}
              required
              className={inputClasses}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="details" className={labelClasses}>
            Details
          </label>
          <textarea
            id="details"
            name="details"
            rows={6}
            defaultValue={event.details}
            required
            className={`${inputClasses} resize-none`}
          />
        </div>
      </form>
      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 -mx-8 -mb-8 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-zinc-600 font-bold hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Cancel
        </button>
        <button
          form="edit-event-form"
          type="submit"
          disabled={isUpdating}
          className="px-8 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
