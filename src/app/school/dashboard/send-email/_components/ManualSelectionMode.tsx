"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAlumniAction,
  getUniqueSchoolSectorsAction,
} from "@/app/actions/alumni";
import type { Alumnus } from "@/lib/db/entities";

interface ManualSelectionModeProps {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
}

export function ManualSelectionMode({
  onSelectionChange,
  initialSelectedIds = [],
}: ManualSelectionModeProps) {
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds),
  );

  // Filters
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    const result = await getAlumniAction({
      fullName: search || undefined,
      schoolSector: sector || undefined,
      graduationYear: graduationYear
        ? Number.parseInt(graduationYear, 10)
        : undefined,
      page,
      limit: 10,
    });

    if ("items" in result) {
      setAlumni(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    }
    setLoading(false);
  }, [search, sector, graduationYear, page]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  useEffect(() => {
    const fetchSectors = async () => {
      const result = await getUniqueSchoolSectorsAction();
      if ("sectors" in result && result.sectors) {
        setSectors(result.sectors);
      }
    };
    fetchSectors();
  }, []);

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const handleSelectAllOnPage = (selected: boolean) => {
    const newSelected = new Set(selectedIds);
    for (const alumnus of alumni) {
      if (selected) {
        newSelected.add(alumnus.id);
      } else {
        newSelected.delete(alumnus.id);
      }
    }
    setSelectedIds(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const allOnPageSelected =
    alumni.length > 0 && alumni.every((a) => selectedIds.has(a.id));
  const someOnPageSelected =
    alumni.length > 0 && alumni.some((a) => selectedIds.has(a.id));

  // Generate graduation years (last 50 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all"
          />
        </div>
        <div>
          <label
            htmlFor="sector"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Sector
          </label>
          <select
            id="sector"
            value={sector}
            onChange={(e) => {
              setSector(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all"
          >
            <option value="">All Sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="graduationYear"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Graduation Year
          </label>
          <select
            id="graduationYear"
            value={graduationYear}
            onChange={(e) => {
              setGraduationYear(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <input
            id="select-all"
            type="checkbox"
            checked={allOnPageSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate = someOnPageSelected && !allOnPageSelected;
              }
            }}
            onChange={(e) => handleSelectAllOnPage(e.target.checked)}
            className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-zinc-50 dark:checked:border-zinc-50"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer"
          >
            {selectedIds.size} students selected
          </label>
        </div>
        <div className="text-sm text-zinc-500">Total: {total} students</div>
      </div>

      {/* Alumni List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100 mb-4" />
            <p className="text-zinc-500">Loading students...</p>
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500">
              No students found matching your filters.
            </p>
          </div>
        ) : (
          alumni.map((alumnus) => (
            <div
              key={alumnus.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                selectedIds.has(alumnus.id)
                  ? "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-900 dark:border-zinc-100 shadow-sm"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <input
                id={`student-${alumnus.id}`}
                type="checkbox"
                checked={selectedIds.has(alumnus.id)}
                onChange={(e) => handleSelect(alumnus.id, e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-zinc-50 dark:checked:border-zinc-50"
              />
              <label
                htmlFor={`student-${alumnus.id}`}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate">
                  {alumnus.fullName}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Graduation</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Class of {alumnus.graduationYear}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Sector</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {alumnus.schoolSector}
                  </span>
                </div>
              </label>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {page}
            </span>
            <span className="text-sm text-zinc-400">/</span>
            <span className="text-sm text-zinc-400">{totalPages}</span>
          </div>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
