"use client";

import type { EventCreationInput } from "@/lib/validation/events";
import { EventEditForm } from "./EventEditForm";
import type { SerializedEvent } from "./types";

interface EventDetailsModalProps {
  event: SerializedEvent;
  mode: "view" | "edit";
  setMode: (mode: "view" | "edit") => void;
  onClose: () => void;
  showPostButton?: boolean;
  isUpdating: boolean;
  onUpdate: (data: EventCreationInput) => Promise<void>;
  updateError: string | null;
}

export function EventDetailsModal({
  event,
  mode,
  setMode,
  onClose,
  showPostButton,
  isUpdating,
  onUpdate,
  updateError,
}: EventDetailsModalProps) {
  const eventDate = new Date(event.datetime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Backdrop interaction for closing modal */}
      <div
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="presentation"
      />
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Click handler is only for stopPropagation */}
      <div
        className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {mode === "view" ? "Event Details" : "Edit Event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Close</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {mode === "view" ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Event Name
                </h3>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {event.name}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Organized by
                  </h3>
                  <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50">
                    {event.school?.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Date &amp; Time
                  </h3>
                  <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50">
                    {eventDate.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    <br />
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {eventDate.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Location
                  </h3>
                  <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50">
                    {event.location}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Details
                </h3>
                <div className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {event.details}
                </div>
              </div>
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 -mx-8 -mb-8 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-zinc-600 font-bold hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Close
                </button>
                {showPostButton && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMode("edit");
                    }}
                    className="px-8 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Edit Event
                  </button>
                )}
              </div>
            </div>
          ) : (
            <EventEditForm
              event={event}
              onCancel={() => setMode("view")}
              isUpdating={isUpdating}
              onSubmit={onUpdate}
              updateError={updateError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
