"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { logoutAction } from "@/app/actions/auth";
import { JobList } from "@/components/jobs/JobList";

type Tab = "actions" | "events" | "jobs" | "account";

interface SchoolDashboardClientProps {
  schoolId: string;
}

export function SchoolDashboardClient({
  schoolId,
}: SchoolDashboardClientProps) {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardTabs schoolId={schoolId} />
    </Suspense>
  );
}

function DashboardTabs({ schoolId }: { schoolId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("tab") as Tab) || "actions";

  const actions = [
    {
      title: "Add New Students",
      description:
        "Manually enter or bulk upload student data to the database.",
      href: "/school/dashboard/new-alumni",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Add Students</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      primary: true,
    },
    {
      title: "Send Email",
      description:
        "Communicate with alumni via scheduled or manual email campaigns.",
      href: "/school/dashboard/send-email",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Send Email</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Add Event",
      description: "Organize reunions, networking sessions, or workshops.",
      href: "#",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Add Event</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      disabled: true,
    },
    {
      title: "Add Job Opening",
      description:
        "Share career opportunities from partner companies or alumni.",
      href: "/school/dashboard/jobs/new",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Add Job Opening</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  const handleTabChange = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "actions", label: "Actions" },
    { id: "events", label: "Events" },
    { id: "jobs", label: "Jobs" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="space-y-8">
      <nav className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="min-h-[400px]">
        {activeTab === "actions" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {actions.map((action) => (
              <div
                key={action.title}
                className={`group relative rounded-2xl border p-6 transition-all ${
                  action.disabled
                    ? "bg-zinc-100 border-zinc-200 opacity-60 cursor-not-allowed dark:bg-zinc-900/50 dark:border-zinc-800"
                    : "bg-white border-zinc-200 hover:border-zinc-900 hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-xl ${
                      action.primary
                        ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    }`}
                  >
                    {action.icon}
                  </div>
                  {!action.disabled && (
                    <Link
                      href={action.href}
                      className="absolute inset-0 focus:outline-none"
                      aria-label={action.title}
                    >
                      <span className="sr-only">Go to {action.title}</span>
                    </Link>
                  )}
                </div>
                <div className="mt-6">
                  <h3
                    className={`text-xl font-bold ${
                      action.disabled
                        ? "text-zinc-500"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {action.title}
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    {action.description}
                  </p>
                </div>
                {!action.disabled && (
                  <div className="mt-6 flex items-center text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:translate-x-1 transition-transform">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Arrow Right</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "events" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center dark:bg-zinc-900 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-zinc-800">
              <svg
                className="w-8 h-8 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Events Icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              No Upcoming Events
            </h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Events you organize will appear here.
            </p>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <JobList showPostButton schoolId={schoolId} />
          </div>
        )}

        {activeTab === "account" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 dark:bg-zinc-900 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Account Settings
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Manage your profile and session.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logoutAction();
                }}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
