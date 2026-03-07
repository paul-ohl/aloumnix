"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect } from "react";
import {
  requestAlumniOtpAction,
  verifyAlumniOtpAction,
} from "@/app/actions/auth";

// ─── Step 1: request OTP ───────────────────────────────────────────────────

function RequestOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to") ?? "";

  const [state, formAction, isPending] = useActionState(
    requestAlumniOtpAction,
    { error: null },
  );

  // When the action succeeds, move to step 2 with the email (and redirect_to) in the URL.
  useEffect(() => {
    if (state?.success && state.email) {
      const params = new URLSearchParams({
        step: "verify",
        email: state.email,
      });
      if (redirectTo) params.set("redirect_to", redirectTo);
      router.push(`/login/alumni?${params.toString()}`);
    }
  }, [state, router, redirectTo]);

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Alumni Login
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Enter your email address and we&apos;ll send you a one-time login
          code.
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
            placeholder="you@example.com"
            className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          {isPending ? "Sending code..." : "Send login code"}
        </button>
      </form>
    </>
  );
}

// ─── Step 2: verify OTP ────────────────────────────────────────────────────

interface VerifyOtpFormProps {
  email: string;
  redirectTo?: string;
}

function VerifyOtpForm({ email, redirectTo }: VerifyOtpFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(verifyAlumniOtpAction, {
    error: null,
  });

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Enter your code
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          If{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {email}
          </span>{" "}
          is registered, a 6-digit code has been sent to it. It expires in 10
          minutes.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-8 space-y-6">
        {/* Pass email as hidden field so the server action has it */}
        <input type="hidden" name="email" value={email} />
        {/* Pass redirect_to so the server action can redirect after login */}
        {redirectTo && (
          <input type="hidden" name="redirect_to" value={redirectTo} />
        )}

        <div className="space-y-2">
          <label
            htmlFor="code"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Login code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            required
            placeholder="123456"
            className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-center text-2xl font-bold tracking-widest placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          {isPending ? "Verifying..." : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => router.push("/login/alumni")}
        className="mt-2 w-full text-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Use a different email
      </button>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

function AlumniLoginContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");
  const email = searchParams.get("email") ?? "";
  const redirectTo = searchParams.get("redirect_to") ?? "";

  const isVerifyStep = step === "verify" && email.length > 0;

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {isVerifyStep ? (
        <VerifyOtpForm email={email} redirectTo={redirectTo || undefined} />
      ) : (
        <RequestOtpForm />
      )}

      <div className="mt-6 text-center border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <Link
          href="/login/school"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Switch to School Login →
        </Link>
      </div>
    </div>
  );
}

export default function AlumniLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Suspense
        fallback={
          <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          </div>
        }
      >
        <AlumniLoginContent />
      </Suspense>
    </div>
  );
}
