import Link from "next/link";

export default function AlumniPage() {
  const actions = [
    {
      title: "Add New Students",
      description:
        "Manually enter or bulk upload student data to the database.",
      href: "/alumni/new",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
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
      href: "#",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      disabled: true,
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
          aria-hidden="true"
        >
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
      href: "#",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      disabled: true,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2 dark:text-zinc-50">
            Alumni Management
          </h1>
          <p className="text-zinc-600 text-lg dark:text-zinc-400">
            Quick actions to manage your alumni network and engagement.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    aria-hidden="true"
                  >
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
      </div>
    </main>
  );
}
