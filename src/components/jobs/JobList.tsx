"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getJobsAction, updateJobAction } from "@/app/actions/jobs";
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const result = await getJobsAction({ schoolId, page, limit: 10 });
    if ("error" in result && result.error) {
      setError(result.error);
    } else if ("items" in result && result.items) {
      setJobs(result.items as SerializedJob[]);
      if ("totalPages" in result && result.totalPages) {
        setTotalPages(result.totalPages);
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

    setIsUpdating(true);
    setUpdateError(null);

    const result = await updateJobAction(selectedJob.id, data);

    if (result.error) {
      setUpdateError(result.error);
    } else {
      await fetchJobs();
      handleCloseModal();
    }
    setIsUpdating(false);
  };

  if (loading && jobs.length === 0) {
    return <JobLoading />;
  }

  if (error) {
    return <JobError message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
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
                menuRef={menuRef}
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
          isUpdating={isUpdating}
          onUpdate={handleUpdateJob}
          updateError={updateError}
        />
      )}
    </div>
  );
}
