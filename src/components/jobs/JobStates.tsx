"use client";

import Link from "next/link";

export function JobLoading() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-50" />
    </div>
  );
}

export function JobError({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {message}
    </div>
  );
}

export function JobEmpty({ showPostButton }: { showPostButton?: boolean }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center dark:bg-zinc-900 dark:border-zinc-800">
      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-zinc-800">
        <svg
          className="w-8 h-8 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Jobs Icon</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
        No Active Job Openings
      </h3>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {showPostButton
          ? "Career opportunities you share will appear here."
          : "Explore career opportunities tailored for your network."}
      </p>
    </div>
  );
}

export function PostJobButton() {
  return (
    <div className="flex justify-end">
      <Link
        href="/school/dashboard/jobs/new"
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
        Post New Job
      </Link>
    </div>
  );
}
