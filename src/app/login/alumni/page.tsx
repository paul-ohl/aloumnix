"use client";

import { useActionState } from "react";
import { loginAlumniAction } from "@/app/actions/auth";

export default function AlumniLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAlumniAction, {
    error: null,
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Alumni Login
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your email and password to access your account.
          </p>
        </div>

        {state?.error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={state?.email}
              placeholder="you@example.com"
              className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue={state?.password}
              placeholder="••••••••"
              className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Leave empty if this is your first login.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
