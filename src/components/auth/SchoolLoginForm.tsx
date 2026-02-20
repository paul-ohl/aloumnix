"use client";

import { useActionState } from "react";
import { loginSchoolAction } from "@/app/actions/auth";
import { SchoolSelect } from "./SchoolSelect";

interface SchoolLoginFormProps {
  schools: {
    id: string;
    name: string;
    location: string;
  }[];
}

export function SchoolLoginForm({ schools }: SchoolLoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginSchoolAction, {
    error: null,
  });

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </div>
      )}

      <SchoolSelect schools={schools} />

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
  );
}
