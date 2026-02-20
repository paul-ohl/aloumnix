import { redirect } from "next/navigation";
import { AuthService } from "@/lib/auth/service";
import { AlumnusDashboardClient } from "./_components/AlumnusDashboardClient";

export default async function AlumnusDashboardPage() {
  const session = await AuthService.getSession();

  if (!session || session.role !== "alumnus") {
    redirect("/login/alumni");
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2 dark:text-zinc-50">
            Alumni Dashboard
          </h1>
          <p className="text-zinc-600 text-lg dark:text-zinc-400">
            Connect with your network and explore opportunities.
          </p>
        </header>

        <AlumnusDashboardClient />
      </div>
    </main>
  );
}
