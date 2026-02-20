"use client";

import { useState } from "react";
import { CsvAlumnusUpload } from "./CsvAlumnusUpload";
import { ManualAlumnusForm } from "./ManualAlumnusForm";

type Tab = "manual" | "bulk";

export function NewAlumnusClient() {
  const [activeTab, setActiveTab] = useState<Tab>("manual");

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <nav className="flex border-b border-zinc-200 bg-zinc-50/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === "manual"
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100/50"
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === "bulk"
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100/50"
            }`}
          >
            Bulk CSV Upload
          </button>
        </nav>

        <div className="p-1">
          {activeTab === "manual" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ManualAlumnusForm />
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
