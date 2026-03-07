import Link from "next/link";
import { SchoolLoginForm } from "@/components/auth/SchoolLoginForm";
import { getSchools } from "@/lib/services/SchoolService";

export default async function SchoolLoginPage() {
  const { items: schoolsData } = await getSchools({ limit: 100 });

  // Convert TypeORM entities (classes) to plain objects for Client Components
  const schools = schoolsData.map((school) => ({
    id: school.id,
    name: school.name,
    location: school.location,
  }));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="mb-8">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 hover:opacity-75 transition-opacity"
        >
          Aloumnix
        </Link>
      </div>
      <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            School Login
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Select your school and enter your password.
          </p>
        </div>

        <SchoolLoginForm schools={schools} />

        <div className="mt-6 text-center border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <Link
            href="/login/alumni"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Switch to Alumni Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
