"use client";

import { useState } from "react";
import { CsvAlumnusUpload } from "./CsvAlumnusUpload";
import { ManualAlumnusForm } from "./ManualAlumnusForm";

type Tab = "manual" | "bulk";

interface NewAlumnusClientProps {
  schools: { id: string; name: string; location: string }[];
  defaultSchoolId: string;
}

export function NewAlumnusClient({
  schools,
  defaultSchoolId,
}: NewAlumnusClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("manual");

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <nav className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === "manual"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === "bulk"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
            }`}
          >
            Bulk CSV Upload
          </button>
        </nav>

        <div className="p-1">
          {activeTab === "manual" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ManualAlumnusForm
                schools={schools}
                defaultSchoolId={defaultSchoolId}
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CsvAlumnusUpload />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
