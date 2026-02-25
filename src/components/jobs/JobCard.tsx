"use client";

import type { SerializedJob } from "./types";

interface JobCardProps {
  job: SerializedJob;
  showPostButton?: boolean;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onView: (job: SerializedJob) => void;
  onEdit: (job: SerializedJob) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export function JobCard({
  job,
  showPostButton,
  openMenuId,
  setOpenMenuId,
  onView,
  onEdit,
  menuRef,
}: JobCardProps) {
  return (
    <div className="group relative bg-white border border-zinc-200 rounded-2xl p-6 hover:border-zinc-900 transition-all cursor-pointer dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-50">
      <button
        type="button"
        className="absolute inset-0 w-full h-full rounded-2xl"
        onClick={() => onView(job)}
      >
        <span className="sr-only">View job details</span>
      </button>

      <div className="relative flex justify-between items-start mb-4 pointer-events-none">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {job.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {job.school?.name}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {showPostButton && (
          <div
            className="relative pointer-events-auto"
            ref={openMenuId === job.id ? menuRef : null}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === job.id ? null : job.id);
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

            {openMenuId === job.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(job);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Edit job opening
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="relative text-zinc-600 dark:text-zinc-400 line-clamp-2 pointer-events-none">
        {job.details}
      </p>
    </div>
  );
}
