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
    const result = await getJobsAction({ schoolId });
    if ("error" in result && result.error) {
      setError(result.error);
    } else if ("items" in result && result.items) {
      setJobs(result.items as SerializedJob[]);
    }
    setLoading(false);
  }, [schoolId]);

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
      {showPostButton && <PostJobButton />}

      {jobs.length === 0 ? (
        <JobEmpty showPostButton={showPostButton} />
      ) : (
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
