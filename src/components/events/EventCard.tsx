"use client";

import type { SerializedEvent } from "./types";

interface EventCardProps {
  event: SerializedEvent;
  showPostButton?: boolean;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onView: (event: SerializedEvent) => void;
  onEdit: (event: SerializedEvent) => void;
  onDelete: (id: string) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export function EventCard({
  event,
  showPostButton,
  openMenuId,
  setOpenMenuId,
  onView,
  onEdit,
  onDelete,
  menuRef,
  selected,
  onSelect,
}: EventCardProps) {
  const eventDate = new Date(event.datetime);
  const isUpcoming = eventDate > new Date();

  return (
    <div
      className={`group relative bg-white border rounded-2xl p-6 transition-all cursor-pointer dark:bg-zinc-900 ${
        selected
          ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-50 dark:ring-zinc-50"
          : "border-zinc-200 hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-50"
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full rounded-2xl"
        onClick={() => onView(event)}
      >
        <span className="sr-only">View event details</span>
      </button>

      <div className="relative flex justify-between items-start mb-4">
        <div className="flex items-start gap-4 flex-1">
          {showPostButton && onSelect && (
            <div className="pt-1.5 pointer-events-auto">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(event.id, e.target.checked);
                }}
                className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-zinc-50 dark:checked:border-zinc-50"
              />
            </div>
          )}
          <div className="flex-1 pointer-events-none">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {event.name}
              </h3>
              {isUpcoming && (
                <span className="text-xs font-bold px-2 py-0.5 bg-zinc-900 text-white rounded-full dark:bg-zinc-50 dark:text-zinc-900">
                  Upcoming
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {event.school?.name}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {eventDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at{" "}
                {eventDate.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {event.location}
              </span>
            </div>
          </div>
        </div>

        {showPostButton && (
          <div
            className="relative pointer-events-auto"
            ref={openMenuId === event.id ? menuRef : null}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === event.id ? null : event.id);
              }}
              className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Actions</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </button>

            {openMenuId === event.id && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Edit event
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete event
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="relative text-zinc-600 dark:text-zinc-400 line-clamp-2 pointer-events-none">
        {event.details}
      </p>
    </div>
  );
}
