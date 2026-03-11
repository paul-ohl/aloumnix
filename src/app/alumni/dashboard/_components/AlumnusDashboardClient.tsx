"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  deleteOwnAccountAction,
  getOwnProfileAction,
  updateOwnProfileAction,
} from "@/app/actions/alumni";
import { logoutAction } from "@/app/actions/auth";
import { EventList } from "@/components/events/EventList";
import { JobList } from "@/components/jobs/JobList";

type Tab = "messages" | "events" | "jobs" | "account";

interface AlumnusProfile {
  id: string;
  fullName: string;
  graduationYear: number;
  class?: string;
  schoolSector: string;
  mail: string;
  linkedInProfile?: string;
  professionalStatus?: string;
  schoolName?: string;
}

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

  const [profile, setProfile] = useState<AlumnusProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsProfileLoading(true);
    const result = await getOwnProfileAction();
    if (result.success && result.profile) {
      setProfile(result.profile as AlumnusProfile);
    }
    setIsProfileLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "account") {
      fetchProfile();
    }
  }, [activeTab, fetchProfile]);

  const handleTabChange = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateOwnProfileAction({
      mail: formData.get("mail") as string,
      linkedInProfile: formData.get("linkedInProfile") as string,
      professionalStatus: formData.get("professionalStatus") as string,
    });

    if (result.error) {
      alert(result.error);
    } else {
      alert("Profile updated successfully!");
      fetchProfile();
    }
    setIsUpdatingProfile(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteOwnAccountAction();
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      router.push("/");
    }
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {isProfileLoading ? (
              <div className="text-center py-12 text-zinc-500">
                Loading profile...
              </div>
            ) : profile ? (
              <>
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 dark:bg-zinc-900 dark:border-zinc-800">
                  <header className="mb-8">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      My Profile
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Update your contact information and professional status.
                    </p>
                  </header>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          disabled
                          value={profile.fullName}
                          className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                        />
                        <p className="text-[10px] text-zinc-400">
                          Contact your school to change your identity.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="mail"
                          className="block text-sm font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          Email Address
                        </label>
                        <input
                          id="mail"
                          name="mail"
                          type="email"
                          defaultValue={profile.mail}
                          required
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="linkedInProfile"
                          className="block text-sm font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          LinkedIn Profile URL
                        </label>
                        <input
                          id="linkedInProfile"
                          name="linkedInProfile"
                          type="url"
                          defaultValue={profile.linkedInProfile}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="professionalStatus"
                          className="block text-sm font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          Professional Status
                        </label>
                        <input
                          id="professionalStatus"
                          name="professionalStatus"
                          defaultValue={profile.professionalStatus}
                          placeholder="e.g. Software Engineer at Google"
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                          School & Sector
                        </label>
                        <div className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                          {profile.schoolName} — {profile.schoolSector} (
                          {profile.graduationYear})
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="px-8 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        {isUpdatingProfile ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-8 dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        Logout
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Sign out of your account on this device.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await logoutAction();
                      }}
                      className="px-6 py-2 border border-zinc-200 text-zinc-900 font-bold rounded-lg hover:bg-zinc-50 transition-colors shadow-sm active:scale-95 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-red-100 rounded-2xl p-8 dark:bg-zinc-900 dark:border-red-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                        Danger Zone
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Permanently delete your account and all associated data.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm active:scale-95"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isDeleting && setIsDeleteDialogOpen(false)}
            aria-hidden="true"
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
                  <title>Warning Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Delete Account?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                This action cannot be undone. All your data, including messages,
                event registrations, and profile information, will be
                permanently removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1 px-6 py-3 text-zinc-600 font-bold hover:bg-zinc-100 rounded-2xl transition-all dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
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
                  ) : (
                    "Delete Forever"
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
