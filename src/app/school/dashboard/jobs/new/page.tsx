import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthService } from "@/lib/auth/service";
import { JobCreationForm } from "./_components/JobCreationForm";

export default async function NewJobOpeningPage() {
  const session = await AuthService.getSession();

  if (!session || session.role !== "school") {
    redirect("/login/school");
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <Link
            href="/school/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 mb-4 inline-flex items-center gap-1 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Back</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight dark:text-zinc-50">
            Post New Job
          </h1>
        </header>

        <JobCreationForm schoolId={session.userId} />
      </div>
    </main>
  );
}
