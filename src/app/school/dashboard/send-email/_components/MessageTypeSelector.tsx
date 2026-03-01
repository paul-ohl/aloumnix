"use client";

import type { ReactNode } from "react";

export type MessageType = "general" | "job";

interface MessageTypeSelectorProps {
  value: MessageType;
  onChange: (value: MessageType) => void;
}

/**
 * A selector to choose between "General Information" and "Job Opening" message types.
 * Follows the Zinc palette and consistent UI patterns with ModeSwitcher.
 */
export function MessageTypeSelector({
  value,
  onChange,
}: MessageTypeSelectorProps) {
  const options: { id: MessageType; label: string; icon: ReactNode }[] = [
    {
      id: "general",
      label: "General Information",
      icon: (
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>General Information</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "job",
      label: "Job Opening",
      icon: (
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Job Opening</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Message Type
      </legend>
      <div className="flex flex-col sm:flex-row gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 border ${
              value === option.id
                ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50 shadow-sm"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
