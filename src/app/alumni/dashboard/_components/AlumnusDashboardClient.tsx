"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { logoutAction } from "@/app/actions/auth";
import { EventList } from "@/components/events/EventList";
import { JobList } from "@/components/jobs/JobList";

type Tab = "messages" | "events" | "jobs" | "account";

export function AlumnusDashboardClient() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardTabs />
    </Suspense>
  );
}

function DashboardTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("tab") as Tab) || "messages";
  const highlight = searchParams.get("highlight") ?? undefined;

  const handleTabChange = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "messages", label: "Messages" },
    { id: "events", label: "Events" },
    { id: "jobs", label: "Jobs" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="space-y-8">
      <nav className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl max-w-lg mx-auto overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
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
        {activeTab === "messages" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center dark:bg-zinc-900 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-zinc-800">
              <svg
                className="w-8 h-8 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Messages Icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              No Messages
            </h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Your conversations with the school and alumni will appear here.
            </p>
          </div>
        )}

        {activeTab === "events" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <EventList highlightId={highlight} />
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <JobList highlightId={highlight} />
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
                  Manage your password and notifications.
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
