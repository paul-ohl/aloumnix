"use client";

import { useEffect, useState, useTransition } from "react";
// import { ArrowLeft, Loader2, Send } from "lucide-react";
import { type SendEmailInput, sendEmailAction } from "@/app/actions/email";
import { getJobsAction } from "@/app/actions/jobs";
import type { AlumnusFilters } from "@/lib/services/AlumnusService";
import type { MessageType } from "./MessageTypeSelector";

// Simple SVG Icons since lucide-react is not available
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="24"
    height="24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const Loader2Icon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="24"
    height="24"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="24"
    height="24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

interface EmailComposerProps {
  messageType: MessageType;
  selectedAlumniIds: string[];
  filters: AlumnusFilters;
  schoolId: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface JobItem {
  id: string;
  name: string;
  details: string;
  school: {
    id: string;
    name: string;
    location: string;
  } | null;
}

export function EmailComposer({
  messageType,
  selectedAlumniIds,
  filters,
  schoolId,
  onBack,
  onSuccess,
}: EmailComposerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Job specific states
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [optionalMessage, setOptionalMessage] = useState("");

  // Fetch jobs if messageType is 'job'
  useEffect(() => {
    if (messageType === "job") {
      setIsLoadingJobs(true);
      getJobsAction({ schoolId, limit: 100 })
        .then((result) => {
          if (result.success && result.items) {
            setJobs(result.items);
          } else {
            setError(result.error || "Failed to fetch jobs");
          }
        })
        .finally(() => {
          setIsLoadingJobs(false);
        });
    }
  }, [messageType, schoolId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      let input: SendEmailInput;

      if (messageType === "general") {
        input = {
          type: "general",
          subject,
          message,
          recipientIds:
            selectedAlumniIds.length > 0 ? selectedAlumniIds : undefined,
          filters:
            selectedAlumniIds.length === 0
              ? (filters as SendEmailInput["filters"])
              : undefined,
          schoolId,
        };
      } else {
        // Find selected job to get its details
        const selectedJob = jobs.find((j) => j.id === selectedJobId);

        if (!selectedJob) {
          setError("Please select a job opening");
          return;
        }

        input = {
          type: "job",
          jobId: selectedJobId,
          optionalMessage: optionalMessage || undefined,
          recipientIds:
            selectedAlumniIds.length > 0 ? selectedAlumniIds : undefined,
          filters:
            selectedAlumniIds.length === 0
              ? (filters as SendEmailInput["filters"])
              : undefined,
          schoolId,
        };
      }

      const result = await sendEmailAction(input);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to send email");
      }
    });
  };

  const isManual = selectedAlumniIds.length > 0;
  const recipientCount = isManual ? selectedAlumniIds.length : "filtered";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to selection
          </button>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Compose your {messageType} email
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sending to{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {recipientCount}
            </span>{" "}
            alumni.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {messageType === "general" ? (
          <>
            <div className="space-y-2">
              <label
                htmlFor="subject"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Message
              </label>
              <textarea
                id="message"
                required
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all outline-none resize-none"
              />
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="jobSelection"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Select Job Opening
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <select
                    id="jobSelection"
                    required
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    disabled={isLoadingJobs || jobs.length === 0}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all outline-none appearance-none disabled:opacity-50"
                  >
                    {isLoadingJobs ? (
                      <option>Loading jobs...</option>
                    ) : jobs.length === 0 ? (
                      <option>No jobs found</option>
                    ) : (
                      <>
                        <option value="" disabled>
                          Choose a job opening
                        </option>
                        {jobs.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <a
                  href="/school/dashboard/jobs"
                  className="flex items-center justify-center px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all whitespace-nowrap"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  New Job
                </a>
              </div>
            </div>

            {selectedJobId && (
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Job Preview
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      Title:
                    </span>{" "}
                    {jobs.find((j) => j.id === selectedJobId)?.name}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      Company:
                    </span>{" "}
                    {jobs.find((j) => j.id === selectedJobId)?.school?.name}
                  </p>
                  <p className="line-clamp-2 text-zinc-500 dark:text-zinc-500 mt-2 italic">
                    {jobs.find((j) => j.id === selectedJobId)?.details}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="optionalMessage"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Optional Message{" "}
                <span className="text-zinc-400 font-normal">
                  (Included in email)
                </span>
              </label>
              <textarea
                id="optionalMessage"
                rows={4}
                value={optionalMessage}
                onChange={(e) => setOptionalMessage(e.target.value)}
                placeholder="Add a personal touch to this job alert..."
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all outline-none resize-none"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isPending || (messageType === "job" && !selectedJobId)}
            className="flex items-center justify-center px-8 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/10 dark:shadow-zinc-50/10 min-w-[160px]"
          >
            {isPending ? (
              <>
                <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <SendIcon className="w-5 h-5 mr-2" />
                Send Email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
