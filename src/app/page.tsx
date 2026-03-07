import Link from "next/link";

// ─── Icons ─────────────────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Alumni directory icon</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M17 20h5v-2a4 4 0 00-5.356-3.712M17 20H7m10 0v-2c0-.768-.156-1.5-.438-2.165M7 20H2v-2a4 4 0 015.356-3.712M7 20v-2c0-.768.156-1.5.438-2.165m8.124 0A5.97 5.97 0 0012 14c-1.657 0-3.156.672-4.246 1.758M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Events icon</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Jobs icon</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Email icon</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Arrow right</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-zinc-900 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Check</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight text-zinc-900">
            Aloumnix
          </span>
          <Link
            href="/login/school"
            className="text-sm font-semibold text-zinc-900 border border-zinc-300 rounded-lg px-4 py-2 hover:bg-zinc-50 transition-colors duration-150 cursor-pointer"
          >
            School login
          </Link>
        </div>
      </header>

      <main>
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-semibold text-zinc-600 mb-8 tracking-wide uppercase">
            Built for schools & their graduates
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-zinc-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Keep your alumni{" "}
            <span className="relative inline-block">
              <span className="relative z-10">connected</span>
              <span
                className="absolute inset-x-0 bottom-1 h-3 bg-zinc-200 -z-0 rounded"
                aria-hidden="true"
              />
            </span>{" "}
            after graduation.
          </h1>

          <p className="mt-6 text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Aloumnix gives your school a private portal to stay in touch with
            graduates — share job opportunities, announce events, and keep your
            community strong for years to come.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login/school"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-3.5 text-base font-semibold text-white hover:bg-zinc-700 transition-colors duration-200 cursor-pointer shadow-sm"
            >
              Get started
              <ArrowRightIcon />
            </Link>
            <a
              href="#how-it-works"
              className="text-base font-medium text-zinc-600 hover:text-zinc-900 transition-colors duration-150 cursor-pointer"
            >
              See how it works
            </a>
          </div>
        </section>

        {/* ── Dashboard preview ───────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2 shadow-sm">
            {/* Fake browser chrome */}
            <div className="rounded-xl bg-white border border-zinc-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                <span className="w-3 h-3 rounded-full bg-zinc-200" />
                <span className="w-3 h-3 rounded-full bg-zinc-200" />
                <span className="w-3 h-3 rounded-full bg-zinc-200" />
                <span className="mx-auto text-xs text-zinc-400 font-medium tracking-wide">
                  school.aloumnix.com/dashboard
                </span>
              </div>
              {/* Mock dashboard content */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="col-span-3 sm:col-span-1 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    Total alumni
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-900">
                    248
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    across 12 graduating classes
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-1 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    Upcoming events
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-900">3</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    next: Alumni Reunion — Oct 12
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-1 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    Open job postings
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-900">7</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    shared with graduates this week
                  </div>
                </div>
                <div className="col-span-3 rounded-xl border border-zinc-100 bg-white p-4">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                    Recent activity
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Email sent to Class of 2022",
                        sub: "Job opportunity at Acme Corp",
                        time: "2h ago",
                      },
                      {
                        label: "New event published",
                        sub: "Annual Alumni Networking Night",
                        time: "Yesterday",
                      },
                      {
                        label: "5 new alumni added",
                        sub: "Class of 2024 batch upload",
                        time: "3 days ago",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start justify-between gap-4"
                      >
                        <div>
                          <div className="text-sm font-medium text-zinc-800">
                            {item.label}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {item.sub}
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400 whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem / value prop ─────────────────────────────────── */}
        <section className="bg-zinc-900 text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
              Graduation is not the end of the relationship.
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Many schools lose touch with graduates the moment they leave.
              Aloumnix gives you a simple, private space to keep that
              relationship alive — without the complexity of managing a mailing
              list or social media account.
            </p>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                Everything your school needs in one place
              </h2>
              <p className="mt-4 text-lg text-zinc-500 max-w-xl mx-auto">
                No complicated setup. No technical knowledge required. Just log
                in and start connecting.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <UsersIcon />,
                  title: "Alumni directory",
                  description:
                    "Keep all your graduates in one searchable list. Add them one by one or upload a spreadsheet — and filter by graduation year, field of study, or employment status.",
                },
                {
                  icon: <CalendarIcon />,
                  title: "Events",
                  description:
                    "Publish reunions, networking nights, or career days. Alumni get notified by email and can view all the details in their personal portal.",
                },
                {
                  icon: <BriefcaseIcon />,
                  title: "Job opportunities",
                  description:
                    "Share job openings from partner companies or alumni employers directly with your graduates. Each listing links straight to where they apply.",
                },
                {
                  icon: <EnvelopeIcon />,
                  title: "Direct email outreach",
                  description:
                    "Send personalised emails to all your alumni at once — or target a specific class year. Every link takes them straight to the relevant information.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How alumni experience it ─────────────────────────────── */}
        <section className="bg-zinc-50 py-24 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-600 mb-6 tracking-wide uppercase">
                For graduates
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-snug">
                A simple, private portal your graduates will actually use.
              </h2>
              <p className="mt-4 text-zinc-500 text-lg leading-relaxed">
                Alumni log in with just their email — no password to remember.
                They land on a clean dashboard where they can see upcoming
                events, browse job listings, and stay up to date with their
                school community.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "No app to download — works in any browser",
                  "One-click login via email code, no password needed",
                  "Email links take them directly to the relevant event or job",
                  "Private — only alumni from your school can access it",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-sm text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fake alumni portal preview */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex gap-3">
                {["Messages", "Events", "Jobs", "Account"].map((tab, i) => (
                  <span
                    key={tab}
                    className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
                      i === 1
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-400 bg-zinc-100"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="space-y-3 pt-1">
                {[
                  {
                    name: "Annual Alumni Networking Night",
                    date: "Oct 12, 2025 · 7:00 PM",
                    loc: "Grand Hall, Lyon",
                    badge: "Upcoming",
                  },
                  {
                    name: "Career Workshop — Finance Sector",
                    date: "Nov 3, 2025 · 2:00 PM",
                    loc: "Campus Auditorium",
                    badge: "New",
                  },
                  {
                    name: "Class of 2020 Reunion",
                    date: "Dec 14, 2025 · 6:30 PM",
                    loc: "Le Jardin Event Space",
                    badge: null,
                  },
                ].map((event) => (
                  <div
                    key={event.name}
                    className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">
                          {event.name}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {event.date}
                        </div>
                        <div className="text-xs text-zinc-400">{event.loc}</div>
                      </div>
                      {event.badge && (
                        <span className="text-xs font-semibold bg-zinc-900 text-white rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0">
                          {event.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── For school admins ────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Fake admin panel preview */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4 order-2 lg:order-1">
              <div className="text-sm font-bold text-zinc-900">
                Send an email to your alumni
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-1">
                  <div className="text-xs font-semibold text-zinc-500">
                    Recipients
                  </div>
                  <div className="text-sm text-zinc-800 font-medium">
                    All alumni · 248 people
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-1">
                  <div className="text-xs font-semibold text-zinc-500">
                    Email type
                  </div>
                  <div className="flex gap-2">
                    {["Event invite", "Job opportunity", "General"].map(
                      (t, i) => (
                        <span
                          key={t}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-default ${
                            i === 0
                              ? "bg-zinc-900 text-white"
                              : "text-zinc-400 bg-zinc-100"
                          }`}
                        >
                          {t}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <div className="text-xs font-semibold text-zinc-500 mb-2">
                    Select event
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800">
                    Annual Alumni Networking Night
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-900 text-white text-sm font-semibold text-center py-3 rounded-xl cursor-default">
                  Send to 248 alumni
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-semibold text-zinc-600 mb-6 tracking-wide uppercase">
                For school staff
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-snug">
                Manage everything in a few clicks.
              </h2>
              <p className="mt-4 text-zinc-500 text-lg leading-relaxed">
                No training required. The school dashboard is designed for
                administrative staff — not IT teams. Add alumni, publish events,
                post job listings, and reach everyone by email without ever
                leaving the platform.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Add alumni individually or upload a CSV file",
                  "Create and publish events in under a minute",
                  "Post job opportunities from partner companies",
                  "Send targeted emails to all alumni or specific classes",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-sm text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section className="bg-zinc-900 py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to stay connected with your graduates?
            </h2>
            <p className="mt-4 text-zinc-400 text-lg leading-relaxed">
              Log in to your school account and start building your alumni
              community today.
            </p>
            <Link
              href="/login/school"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors duration-200 cursor-pointer shadow-sm"
            >
              Go to school login
              <ArrowRightIcon />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <span className="font-bold text-zinc-900">Aloumnix</span>
          <span>The alumni portal built for schools.</span>
          <Link
            href="/login/alumni"
            className="hover:text-zinc-700 transition-colors duration-150 cursor-pointer"
          >
            Alumni login
          </Link>
        </div>
      </footer>
    </div>
  );
}
