import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthService } from "@/lib/auth/service";
import { getSchools } from "@/lib/services/SchoolService";
import { NewAlumnusClient } from "./_components/NewAlumnusClient";

export const dynamic = "force-dynamic";

export default async function NewAlumnusPage() {
  const session = await AuthService.getSession();

  if (!session || session.role !== "school") {
    redirect("/login/school");
  }

  const { items: schoolsData } = await getSchools({ limit: 100 });
  const schools = schoolsData.map((s) => ({
    id: s.id,
    name: s.name,
    location: s.location,
  }));

  const currentSchool = {
    id: session.userId,
    name: session.email, // In session, 'email' for school is its 'name'
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <Link
            href="/school/dashboard"
            className="inline-flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-6 group"
          >
            <svg
              className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
            Add New Students
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Add students to {currentSchool.name}.
          </p>
        </header>

        <NewAlumnusClient
          schools={schools}
          defaultSchoolId={currentSchool.id}
        />
      </div>
    </main>
  );
}
