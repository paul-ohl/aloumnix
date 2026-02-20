import { redirect } from "next/navigation";
import { AuthService } from "@/lib/auth/service";
import { SchoolDashboardClient } from "./_components/SchoolDashboardClient";

export default async function SchoolDashboardPage() {
  const session = await AuthService.getSession();

  if (!session || session.role !== "school") {
    redirect("/login/school");
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2 dark:text-zinc-50">
            School Dashboard
          </h1>
          <p className="text-zinc-600 text-lg dark:text-zinc-400">
            Manage your alumni network, events, and job opportunities.
          </p>
        </header>

        <SchoolDashboardClient />
      </div>
    </main>
  );
}
