import Link from "next/link";
import { getSchools } from "@/lib/services/SchoolService";
import { NewAlumnusClient } from "./_components/NewAlumnusClient";

export const dynamic = "force-dynamic";

export default async function NewAlumnusPage() {
  let schools: { id: string; name: string }[] = [];

  try {
    const result = await getSchools({ limit: 100 });
    // Map to plain objects for safe serialization
    schools = result.items.map((s) => ({
      id: s.id,
      name: s.name,
    }));
  } catch (error) {
    console.error("Failed to fetch schools:", error);
    // Continue with empty schools, the client component handles it
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <Link
            href="/alumni"
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group"
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
            Back to Alumni List
          </Link>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">
            Add New Students
          </h1>
          <p className="text-zinc-600 text-lg">
            Choose your preferred method to add students to the database.
          </p>
        </header>

        <NewAlumnusClient schools={schools} />
      </div>
    </main>
  );
}
