import { redirect } from "next/navigation";
import { AuthService } from "@/lib/auth/service";
import { AlumnusDashboardClient } from "./_components/AlumnusDashboardClient";

interface AlumnusDashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AlumnusDashboardPage({
  searchParams,
}: AlumnusDashboardPageProps) {
  const session = await AuthService.getSession();

  if (!session || session.role !== "alumnus") {
    // Reconstruct the intended destination so the login page can redirect back
    // after a successful OTP verification.
    const params = await searchParams;
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        qs.set(key, Array.isArray(value) ? value[0] : value);
      }
    }
    const qsStr = qs.toString();
    const redirectTo = qsStr
      ? `/alumni/dashboard?${qsStr}`
      : "/alumni/dashboard";
    redirect(`/login/alumni?redirect_to=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950">
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
