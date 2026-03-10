"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAlumniAction,
  getUniqueSchoolSectorsAction,
} from "@/app/actions/alumni";
import type { AlumnusFilters } from "@/lib/services/AlumnusService";

interface FilteredSelectionModeProps {
  onFilterChange: (filters: AlumnusFilters) => void;
  initialFilters?: AlumnusFilters;
}

export function FilteredSelectionMode({
  onFilterChange,
  initialFilters = {},
}: FilteredSelectionModeProps) {
  const [search, setSearch] = useState(initialFilters.fullName || "");
  const [sector, setSector] = useState(initialFilters.schoolSector || "");
  const [graduationYear, setGraduationYear] = useState(
    initialFilters.graduationYear?.toString() || "",
  );
  const [sectors, setSectors] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate graduation years (last 50 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchSectors = async () => {
      const result = await getUniqueSchoolSectorsAction();
      if ("sectors" in result && result.sectors) {
        setSectors(result.sectors);
      }
    };
    fetchSectors();
  }, []);

  const updateFilters = useCallback(() => {
    const filters: AlumnusFilters = {
      fullName: search || undefined,
      schoolSector: sector || undefined,
      graduationYear: graduationYear
        ? Number.parseInt(graduationYear, 10)
        : undefined,
    };
    onFilterChange(filters);
    return filters;
  }, [search, sector, graduationYear, onFilterChange]);

  useEffect(() => {
    const filters = updateFilters();

    const fetchCount = async () => {
      setIsLoading(true);
      const result = await getAlumniAction({
        ...filters,
        limit: 1, // We only need the total count
      });

      if ("total" in result) {
        setTotalCount(result.total);
      }
      setIsLoading(false);
    };

    const timer = setTimeout(fetchCount, 500); // Debounce
    return () => clearTimeout(timer);
  }, [updateFilters]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label
            htmlFor="filter-search"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Search
          </label>
          <input
            id="filter-search"
            type="text"
            placeholder="Name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="filter-sector"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Sector
          </label>
          <select
            id="filter-sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">All Sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="filter-year"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Graduation Year
          </label>
          <select
            id="filter-year"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all appearance-none cursor-pointer"
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

      <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin" />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              Calculating matching students...
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {totalCount ?? 0}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Students match your current filters
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
              All matching students will receive your message
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
