"use client";

import Link from "next/link";

export function EventLoading() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-50" />
    </div>
  );
}

export function EventError({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {message}
    </div>
  );
}

export function EventEmpty({ showPostButton }: { showPostButton?: boolean }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center dark:bg-zinc-900 dark:border-zinc-800">
      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-zinc-800">
        <svg
          className="w-8 h-8 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Events Icon</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
        No Upcoming Events
      </h3>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {showPostButton
          ? "Events you organize will appear here."
          : "Discover and join reunions, webinars, and workshops."}
      </p>
    </div>
  );
}

export function PostEventButton() {
  return (
    <div className="flex justify-end">
      <Link
        href="/school/dashboard/events/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-sm active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Plus Icon</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create Event
      </Link>
    </div>
  );
}
