"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  deleteAlumnusAction,
  getAlumniAction,
  getUniqueGraduationYearsAction,
  getUniqueSchoolSectorsAction,
  updateAlumnusAction,
} from "@/app/actions/alumni";
import type { AlumnusInput } from "@/lib/validation/alumni";

interface Alumnus {
  id: string;
  fullName: string;
  graduationYear: number;
  class?: string;
  schoolSector: string;
  mail: string;
  linkedInProfile?: string;
  professionalStatus?: string;
}

export function AlumnusManagement() {
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAlumnus, setEditingAlumnus] = useState<Alumnus | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter State
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");

  // Metadata for filters
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [_availableYears, setAvailableYears] = useState<number[]>([]);

  const fetchMetadata = useCallback(async () => {
    const [sectorsRes, yearsRes] = await Promise.all([
      getUniqueSchoolSectorsAction(),
      getUniqueGraduationYearsAction(),
    ]);

    if ("sectors" in sectorsRes && sectorsRes.sectors) {
      setAvailableSectors(sectorsRes.sectors);
    }
    if ("years" in yearsRes && yearsRes.years) {
      setAvailableYears(yearsRes.years);
    }
  }, []);

  const fetchAlumni = useCallback(async () => {
    setIsLoading(true);

    // Parse year safely
    const yearNum = selectedYear
      ? Number.parseInt(selectedYear, 10)
      : undefined;
    const graduationYear =
      yearNum && !Number.isNaN(yearNum) ? yearNum : undefined;

    const result = await getAlumniAction({
      search: search || undefined,
      graduationYear,
      schoolSector: selectedSector || undefined,
      limit: 100,
    });
    if ("error" in result && result.error) {
      setError(result.error);
    } else if ("items" in result && result.items) {
      setAlumni(result.items as Alumnus[]);
    }
    setIsLoading(false);
  }, [search, selectedYear, selectedSector]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlumni();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchAlumni]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alumnus?")) return;

    startTransition(async () => {
      const result = await deleteAlumnusAction(id);
      if (result.error) {
        alert(result.error);
      } else {
        fetchAlumni();
      }
    });
  };

  const handleEdit = (alumnus: Alumnus) => {
    setEditingAlumnus(alumnus);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAlumnus) return;

    const formData = new FormData(e.currentTarget);
    const data: AlumnusInput = {
      fullName: formData.get("fullName") as string,
      graduationYear: Number(formData.get("graduationYear")),
      class: (formData.get("class") as string) || undefined,
      schoolSector: formData.get("schoolSector") as string,
      mail: formData.get("mail") as string,
      linkedInProfile: (formData.get("linkedInProfile") as string) || undefined,
      professionalStatus:
        (formData.get("professionalStatus") as string) || undefined,
    };

    startTransition(async () => {
      const result = await updateAlumnusAction(editingAlumnus.id, data);
      if (result.error) {
        alert(result.error);
      } else {
        setEditingAlumnus(null);
        fetchAlumni();
      }
    });
  };

  const selectClasses =
    "px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:focus:ring-zinc-50";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Manage Alumni
        </h2>
        <button
          type="button"
          onClick={fetchAlumni}
          className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
          title="Refresh"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Refresh</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <label
            htmlFor="search-filter"
            className="text-xs font-bold text-zinc-500 uppercase ml-1"
          >
            Search
          </label>
          <input
            id="search-filter"
            type="text"
            placeholder="Name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-50"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="year-filter"
            className="text-xs font-bold text-zinc-500 uppercase ml-1"
          >
            Graduation Year
          </label>
          <input
            id="year-filter"
            type="text"
            placeholder="e.g. 2024"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-50"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="sector-filter"
            className="text-xs font-bold text-zinc-500 uppercase ml-1"
          >
            Sector
          </label>
          <select
            id="sector-filter"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className={`w-full ${selectClasses}`}
          >
            <option value="">All Sectors</option>
            {availableSectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedYear("");
              setSelectedSector("");
            }}
            className="w-full px-4 py-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Name
                </th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Year
                </th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Sector
                </th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Email
                </th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-50 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {isLoading && alumni.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : alumni.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No alumni found matching your criteria.
                  </td>
                </tr>
              ) : (
                alumni.map((alumnus) => (
                  <tr
                    key={alumnus.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-50">
                        {alumnus.fullName}
                      </div>
                      {alumnus.class && (
                        <div className="text-xs text-zinc-500">
                          {alumnus.class}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {alumnus.graduationYear}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {alumnus.schoolSector}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {alumnus.mail}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(alumnus)}
                          className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Edit</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(alumnus.id)}
                          className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Delete</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingAlumnus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Edit Alumnus
              </h3>
              <button
                type="button"
                onClick={() => setEditingAlumnus(null)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Close</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label
                    htmlFor="edit-fullName"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Full Name
                  </label>
                  <input
                    id="edit-fullName"
                    name="fullName"
                    defaultValue={editingAlumnus.fullName}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="edit-mail"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email
                  </label>
                  <input
                    id="edit-mail"
                    name="mail"
                    type="email"
                    defaultValue={editingAlumnus.mail}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="edit-graduationYear"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Graduation Year
                  </label>
                  <input
                    id="edit-graduationYear"
                    name="graduationYear"
                    type="number"
                    defaultValue={editingAlumnus.graduationYear}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="edit-schoolSector"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Sector
                  </label>
                  <input
                    id="edit-schoolSector"
                    name="schoolSector"
                    defaultValue={editingAlumnus.schoolSector}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="edit-class"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Class
                  </label>
                  <input
                    id="edit-class"
                    name="class"
                    defaultValue={editingAlumnus.class}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="edit-professionalStatus"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Professional Status
                  </label>
                  <input
                    id="edit-professionalStatus"
                    name="professionalStatus"
                    defaultValue={editingAlumnus.professionalStatus}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label
                    htmlFor="edit-linkedInProfile"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    LinkedIn Profile URL
                  </label>
                  <input
                    id="edit-linkedInProfile"
                    name="linkedInProfile"
                    type="url"
                    defaultValue={editingAlumnus.linkedInProfile}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAlumnus(null)}
                  className="px-6 py-2 bg-zinc-100 text-zinc-900 font-bold rounded-lg hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
