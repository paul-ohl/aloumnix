"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { createAlumnusAction } from "@/app/actions/alumni";
import type { AlumnusInput } from "@/lib/validation/alumni";

export function ManualAlumnusForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (success) {
      timeoutId = setTimeout(() => setSuccess(false), 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [success]);

  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setError(null);
    setFieldErrors({});
    setSuccess(false);

    const data: AlumnusInput = {
      fullName: formData.get("fullName") as string,
      graduationYear: Number(formData.get("graduationYear")),
      class: (formData.get("class") as string) || undefined,
      schoolSector: formData.get("schoolSector") as string,
      mail: formData.get("mail") as string,
      linkedInProfile: (formData.get("linkedInProfile") as string) || undefined,
      professionalStatus:
        (formData.get("professionalStatus") as string) || undefined,
    };

    startTransition(async () => {
      const result = await createAlumnusAction(data);
      if (result.error) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setError(result.error);
        }
      } else {
        setSuccess(true);
        formRef.current?.reset();
      }
    });
  }

  const inputClasses =
    "w-full px-4 py-2 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-zinc-900 placeholder:text-zinc-400";
  const labelClasses = "block text-sm font-medium text-zinc-700 mb-1";
  const errorClasses = "text-red-500 text-xs mt-1";

  return (
    <section className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">
          Manual Student Entry
        </h2>
        <p className="text-zinc-500 text-sm">
          Fill in the details below to add a student to the database.
        </p>
      </header>

      <form
        ref={formRef}
        onSubmit={onFormSubmit}
        className="space-y-6"
        data-testid="manual-form-element"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="fullName" className={labelClasses}>
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              placeholder="John Doe"
              className={inputClasses}
            />
            {fieldErrors.fullName && (
              <p className={errorClasses}>{fieldErrors.fullName[0]}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="mail" className={labelClasses}>
              Email Address *
            </label>
            <input
              type="email"
              id="mail"
              name="mail"
              required
              placeholder="john@example.com"
              className={inputClasses}
            />
            {fieldErrors.mail && (
              <p className={errorClasses}>{fieldErrors.mail[0]}</p>
            )}
          </div>

          {/* Graduation Year */}
          <div className="space-y-1">
            <label htmlFor="graduationYear" className={labelClasses}>
              Graduation Year *
            </label>
            <input
              type="number"
              id="graduationYear"
              name="graduationYear"
              required
              min="1900"
              max={new Date().getFullYear() + 10}
              placeholder={new Date().getFullYear().toString()}
              className={inputClasses}
            />
            {fieldErrors.graduationYear && (
              <p className={errorClasses}>{fieldErrors.graduationYear[0]}</p>
            )}
          </div>

          {/* Class */}
          <div className="space-y-1">
            <label htmlFor="class" className={labelClasses}>
              Class / Section
            </label>
            <input
              type="text"
              id="class"
              name="class"
              placeholder="Class A"
              className={inputClasses}
            />
            {fieldErrors.class && (
              <p className={errorClasses}>{fieldErrors.class[0]}</p>
            )}
          </div>

          {/* School Sector */}
          <div className="space-y-1">
            <label htmlFor="schoolSector" className={labelClasses}>
              Major / Sector *
            </label>
            <input
              type="text"
              id="schoolSector"
              name="schoolSector"
              required
              placeholder="Computer Science"
              className={inputClasses}
            />
            {fieldErrors.schoolSector && (
              <p className={errorClasses}>{fieldErrors.schoolSector[0]}</p>
            )}
          </div>

          {/* Professional Status */}
          <div className="space-y-1">
            <label htmlFor="professionalStatus" className={labelClasses}>
              Professional Status
            </label>
            <input
              type="text"
              id="professionalStatus"
              name="professionalStatus"
              placeholder="Software Engineer at Acme Corp"
              className={inputClasses}
            />
            {fieldErrors.professionalStatus && (
              <p className={errorClasses}>
                {fieldErrors.professionalStatus[0]}
              </p>
            )}
          </div>

          {/* LinkedIn Profile */}
          <div className="md:col-span-2 space-y-1">
            <label htmlFor="linkedInProfile" className={labelClasses}>
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              id="linkedInProfile"
              name="linkedInProfile"
              placeholder="https://linkedin.com/in/johndoe"
              className={inputClasses}
            />
            {fieldErrors.linkedInProfile && (
              <p className={errorClasses}>{fieldErrors.linkedInProfile[0]}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm font-medium flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <title>Success</title>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Student added successfully!
            </div>
            <Link
              href="/school/dashboard"
              className="text-green-800 hover:underline font-bold"
            >
              View Dashboard →
            </Link>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto px-8 py-3 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <title>Processing</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Save Student Profile"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
