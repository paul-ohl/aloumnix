"use client";

import { useState } from "react";
import { CsvAlumnusUpload } from "./CsvAlumnusUpload";
import { ManualAlumnusForm } from "./ManualAlumnusForm";

type Tab = "manual" | "bulk";

interface Props {
  schools: { id: string; name: string }[];
}

export function NewAlumnusClient({ schools }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    schools[0]?.id || "",
  );

  if (schools.length === 0) {
    return (
      <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800">
        <h2 className="text-xl font-bold mb-2">No Schools Found</h2>
        <p>You need to add at least one school before you can add students.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* School Selection */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <label
          htmlFor="school-select"
          className="block text-sm font-bold text-zinc-900 mb-2"
        >
          Target School
        </label>
        <select
          id="school-select"
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-medium text-zinc-900"
        >
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-zinc-500">
          All students added below will be associated with this school.
        </p>
      </div>

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
              <ManualAlumnusForm schoolId={selectedSchoolId} />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CsvAlumnusUpload schoolId={selectedSchoolId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
