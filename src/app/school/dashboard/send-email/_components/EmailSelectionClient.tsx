"use client";

import { useState } from "react";
import type { AlumnusFilters } from "@/lib/services/AlumnusService";
import { EmailComposer } from "./EmailComposer";
import { FilteredSelectionMode } from "./FilteredSelectionMode";
import { ManualSelectionMode } from "./ManualSelectionMode";
import { type MessageType, MessageTypeSelector } from "./MessageTypeSelector";
import { ModeSwitcher } from "./ModeSwitcher";

interface EmailSelectionClientProps {
  schoolId: string;
}

export function EmailSelectionClient({ schoolId }: EmailSelectionClientProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectionMode, setSelectionMode] = useState<
    "manual" | "filter" | null
  >(null);
  const [messageType, setMessageType] = useState<MessageType>("general");
  const [selectedAlumniIds, setSelectedAlumniIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<AlumnusFilters>({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center space-y-6 animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Email Sent Successfully!
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Your message has been queued and will be delivered to the selected
          alumni shortly.
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setSelectionMode(null);
              setSelectedAlumniIds([]);
              setFilters({});
              setIsSuccess(false);
            }}
            className="px-8 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-zinc-900/10 dark:shadow-zinc-50/10"
          >
            Send another email
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <EmailComposer
          messageType={messageType}
          selectedAlumniIds={selectedAlumniIds}
          filters={{ ...filters, schoolId }}
          schoolId={schoolId}
          onBack={() => setStep(1)}
          onSuccess={() => setIsSuccess(true)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
      <div className="mb-10">
        <MessageTypeSelector value={messageType} onChange={setMessageType} />
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-10" />

      {!selectionMode ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            How would you like to select students?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectionMode("manual")}
              className="p-6 text-left border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-zinc-50 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Select manually
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Browse through the list of students and select them one by one.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSelectionMode("filter")}
              className="p-6 text-left border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-zinc-50 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Use general filters
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Define filters to select all students that match your criteria.
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Selection Mode
            </h2>
            <ModeSwitcher
              mode={selectionMode}
              onChange={(mode) => setSelectionMode(mode)}
            />
          </div>

          <div
            id={selectionMode === "manual" ? "manual-panel" : "filter-panel"}
            role="tabpanel"
            aria-labelledby={
              selectionMode === "manual" ? "manual-tab" : "filter-tab"
            }
          >
            {selectionMode === "manual" ? (
              <ManualSelectionMode
                onSelectionChange={setSelectedAlumniIds}
                initialSelectedIds={selectedAlumniIds}
              />
            ) : (
              <FilteredSelectionMode
                onFilterChange={setFilters}
                initialFilters={filters}
              />
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              disabled={
                selectionMode === "manual" && selectedAlumniIds.length === 0
              }
              onClick={() => setStep(2)}
              className="px-8 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/10 dark:shadow-zinc-50/10"
            >
              Continue with{" "}
              {selectionMode === "manual"
                ? `${selectedAlumniIds.length} selected`
                : "filters"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
