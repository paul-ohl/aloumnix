"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createJobAction } from "@/app/actions/jobs";
import type { JobCreationInput } from "@/lib/validation/jobs";

interface JobCreationFormProps {
  schoolId: string;
}

export function JobCreationForm({ schoolId }: JobCreationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [additionalFields, setAdditionalFields] = useState<
    { id: string; key: string; value: string }[]
  >([]);

  const addField = () => {
    setAdditionalFields([
      ...additionalFields,
      { id: crypto.randomUUID(), key: "", value: "" },
    ]);
  };

  const removeField = (id: string) => {
    setAdditionalFields(additionalFields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, field: "key" | "value", value: string) => {
    setAdditionalFields(
      additionalFields.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );
  };

  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setError(null);
    setFieldErrors({});

    const additionalInfo: Record<string, string> = {};
    const reservedKeys = ["name", "description", "schoolId"];

    for (const field of additionalFields) {
      const key = field.key.trim();
      if (key) {
        if (reservedKeys.includes(key.toLowerCase())) {
          setError(
            `"${key}" is a reserved field name. Please use a different name.`,
          );
          return;
        }
        if (additionalInfo[key]) {
          setError(
            `Duplicate field name: "${key}". Field names must be unique.`,
          );
          return;
        }
        additionalInfo[key] = field.value;
      }
    }

    const data: JobCreationInput = {
      ...additionalInfo,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      schoolId: schoolId,
    };

    startTransition(async () => {
      const result = await createJobAction(data);
      if (result.error) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors as Record<string, string[]>);
        } else {
          setError(result.error);
        }
      } else {
        router.push("/school/dashboard?tab=jobs");
        router.refresh();
      }
    });
  }

  const inputClasses =
    "w-full px-4 py-2 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-zinc-900 placeholder:text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50";
  const labelClasses =
    "block text-sm font-medium text-zinc-700 mb-1 dark:text-zinc-300";
  const errorClasses = "text-red-500 text-xs mt-1";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Create Job Opening
        </h2>
        <p className="text-zinc-500 text-sm dark:text-zinc-400">
          Fill in the details below to post a new job opening for your alumni.
        </p>
      </header>

      <form onSubmit={onFormSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Job Name */}
          <div className="space-y-1">
            <label htmlFor="name" className={labelClasses}>
              Job Title *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g. Senior Frontend Engineer"
              className={inputClasses}
            />
            {fieldErrors.name && (
              <p className={errorClasses}>{fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className={labelClasses}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Provide a detailed description of the role..."
              className={inputClasses}
            />
            {fieldErrors.description && (
              <p className={errorClasses}>{fieldErrors.description[0]}</p>
            )}
          </div>

          {/* Additional Info Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Additional Details (Salary, Location, Starting date, etc.)
              </h3>
              <button
                type="button"
                onClick={addField}
                className="text-xs font-bold text-zinc-900 hover:underline dark:text-zinc-50"
              >
                + Add Field
              </button>
            </div>

            {additionalFields.map((field) => (
              <div
                key={field.id}
                className="flex gap-2 items-start animate-in fade-in duration-200"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Field Name (e.g. Salary)"
                    value={field.key}
                    onChange={(e) =>
                      updateField(field.id, "key", e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
                <div className="flex-[2]">
                  <input
                    type="text"
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) =>
                      updateField(field.id, "value", e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  aria-label="Remove field"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Remove Field</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {additionalFields.length === 0 && (
              <p className="text-sm text-zinc-500 italic">
                No additional details added.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm dark:bg-red-900/20 dark:border-red-900/30">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto px-8 py-3 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? "Creating..." : "Create Job Opening"}
          </button>
        </div>
      </form>
    </div>
  );
}
