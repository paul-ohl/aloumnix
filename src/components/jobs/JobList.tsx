"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteJobAction,
  deleteJobsAction,
  getJobsAction,
  updateJobAction,
} from "@/app/actions/jobs";
import type { JobCreationInput } from "@/lib/validation/jobs";
import { JobCard } from "./JobCard";
import { JobDetailsModal } from "./JobDetailsModal";
import { JobEmpty, JobError, JobLoading, PostJobButton } from "./JobStates";
import type { SerializedJob } from "./types";

interface JobListProps {
  showPostButton?: boolean;
  schoolId?: string;
}

export function JobList({ showPostButton = false, schoolId }: JobListProps) {
  const [jobs, setJobs] = useState<SerializedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedJob, setSelectedJob] = useState<SerializedJob | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [isPending, setIsPending] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const result = await getJobsAction({ schoolId, page, limit: 10 });
    if ("error" in result && result.error) {
      setError(result.error);
    } else if ("items" in result && result.items) {
      const items = result.items as SerializedJob[];
      const totalPagesResult =
        "totalPages" in result && result.totalPages ? result.totalPages : 1;

      // If page is empty and not the first page, go back
      if (items.length === 0 && page > 1 && page > totalPagesResult) {
        setPage(totalPagesResult);
      } else {
        setJobs(items);
        setTotalPages(totalPagesResult);
      }
    }
    setLoading(false);
  }, [schoolId, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenModal = (
    job: SerializedJob,
    mode: "view" | "edit" = "view",
  ) => {
    setSelectedJob(job);
    setModalMode(mode);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setModalMode("view");
    setUpdateError(null);
  };

  const handleUpdateJob = async (data: JobCreationInput) => {
    if (!selectedJob) return;

    setIsPending(true);
    setUpdateError(null);

    const result = await updateJobAction(selectedJob.id, data);

    if (result.error) {
      setUpdateError(result.error);
    } else {
      await fetchJobs();
      handleCloseModal();
    }
    setIsPending(false);
  };

  const handleDeleteJob = async (id: string) => {
    setIsPending(true);
    const result = await deleteJobAction(id);
    if (result.error) {
      alert(result.error);
    } else {
      await fetchJobs();
    }
    setDeleteId(null);
    setIsPending(false);
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAllOnPage = (selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const job of jobs) {
        if (selected) {
          next.add(job.id);
        } else {
          next.delete(job.id);
        }
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsPending(true);

    const idsArray = Array.from(selectedIds);
    const result = await deleteJobsAction(idsArray);

    if (result.error) {
      alert(result.error);
    } else {
      setSelectedIds(new Set());
      await fetchJobs();
    }

    setIsPending(false);
    setDeleteId(null);
  };

  if (loading && jobs.length === 0) {
    return <JobLoading />;
  }

  if (error) {
    return <JobError message={error} />;
  }

  const allOnPageSelected =
    jobs.length > 0 && jobs.every((job) => selectedIds.has(job.id));
  const someOnPageSelected =
    jobs.length > 0 && jobs.some((job) => selectedIds.has(job.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showPostButton && jobs.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <input
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
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Select Page
              </span>
            </div>
          )}
          {selectedIds.size > 0 && (
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {selectedIds.size} selected
            </span>
          )}
        </div>
        {showPostButton && <PostJobButton />}
      </div>

      {jobs.length === 0 ? (
        <JobEmpty showPostButton={showPostButton} />
      ) : (
        <>
          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                showPostButton={showPostButton}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onView={(job) => handleOpenModal(job, "view")}
                onEdit={(job) => handleOpenModal(job, "edit")}
                onDelete={(id) => {
                  setDeleteId(id);
                  setOpenMenuId(null);
                }}
                menuRef={menuRef}
                selected={selectedIds.has(job.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Previous Page</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => {
                    // Logic for collapsing pages
                    const isFirstPage = p === 1;
                    const isLastPage = p === totalPages;
                    const isNearCurrent = Math.abs(p - page) <= 1;

                    if (isFirstPage || isLastPage || isNearCurrent) {
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                            page === p
                              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }

                    // Show ellipsis if we are at the boundary of hidden pages
                    if (
                      (p === page - 2 && page > 3) ||
                      (p === page + 2 && page < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={p}
                          className="w-10 h-10 flex items-center justify-center text-zinc-400"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  },
                )}
              </div>

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Next Page</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          mode={modalMode}
          setMode={setModalMode}
          onClose={handleCloseModal}
          showPostButton={showPostButton}
          isUpdating={isPending}
          onUpdate={handleUpdateJob}
          updateError={updateError}
        />
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[55] animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 dark:border-zinc-900/10 backdrop-blur-md bg-opacity-90">
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none">
                {selectedIds.size} Job Openings
              </span>
              <span className="text-xs opacity-60">Selection active</span>
            </div>
            <div className="h-8 w-px bg-white/20 dark:bg-zinc-900/20" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setSelectedIds(new Set())}
                className="px-4 py-2 text-sm font-bold hover:bg-white/10 dark:hover:bg-zinc-900/10 rounded-xl transition-all disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeleteId("bulk")}
                className="px-4 py-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Delete</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Backdrop interaction */}
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isPending && setDeleteId(null)}
            role="presentation"
          />
          <div
            className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8"
            role="dialog"
            aria-modal="true"
          >
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Warning</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {deleteId === "bulk"
                  ? `Delete ${selectedIds.size} Job Openings?`
                  : "Delete Job Opening?"}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                {deleteId === "bulk"
                  ? "Are you sure you want to permanently remove the selected job openings? This action cannot be undone."
                  : "This action cannot be undone. All data associated with this job opening will be permanently removed."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-3 text-zinc-600 font-bold hover:bg-zinc-100 rounded-2xl transition-all dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    deleteId === "bulk"
                      ? handleBulkDelete()
                      : handleDeleteJob(deleteId)
                  }
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <title>Loading</title>
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Deleting...
                    </>
                  ) : deleteId === "bulk" ? (
                    "Delete All"
                  ) : (
                    "Delete Opening"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
