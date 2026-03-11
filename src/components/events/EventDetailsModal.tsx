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
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
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
  onJoin,
  onLeave,
  updateError,
}: EventDetailsModalProps) {
  const eventDate = new Date(event.datetime);
  const isUpcoming = eventDate > new Date();

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
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Event Name
                  </h3>
                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {event.name}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end">
                  <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Participants
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                      {event.participantCount}
                    </span>
                    {event.isParticipating && (
                      <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        ✓ Registered
                      </span>
                    )}
                  </div>
                </div>
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
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 -mx-8 -mb-8 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-zinc-600 font-bold hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50 order-2 sm:order-1"
                >
                  Close
                </button>
                <div className="flex gap-3 order-1 sm:order-2">
                  {showPostButton && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMode("edit");
                      }}
                      className="flex-1 sm:flex-none px-8 py-2.5 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-xl hover:bg-zinc-50 transition-all shadow-sm active:scale-95 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-700"
                    >
                      Edit Event
                    </button>
                  )}
                  {!showPostButton &&
                    isUpcoming &&
                    (event.isParticipating ? (
                      <button
                        type="button"
                        onClick={() => onLeave?.(event.id)}
                        className="flex-1 sm:flex-none px-8 py-2.5 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all active:scale-95 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Cancel Participation
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onJoin?.(event.id)}
                        className="flex-1 sm:flex-none px-8 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        Participate
                      </button>
                    ))}
                </div>
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
