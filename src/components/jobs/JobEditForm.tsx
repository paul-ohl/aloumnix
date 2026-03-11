"use client";

import { useState } from "react";
import type { JobCreationInput } from "@/lib/validation/jobs";
import type { SerializedJob } from "./types";

interface JobEditFormProps {
  job: SerializedJob;
  onSuccess: () => void;
  onCancel: () => void;
  isUpdating: boolean;
  onSubmit: (data: JobCreationInput) => Promise<void>;
  updateError: string | null;
}

export function JobEditForm({
  job,
  onCancel,
  isUpdating,
  onSubmit,
  updateError,
}: JobEditFormProps) {
  const [additionalFields, setAdditionalFields] = useState<
    { key: string; value: string }[]
  >(
    Object.entries(job.additional_info || {}).map(([key, value]) => ({
      key,
      value,
    })),
  );

  const handleAddAdditionalField = () => {
    setAdditionalFields([...additionalFields, { key: "", value: "" }]);
  };

  const handleRemoveAdditionalField = (index: number) => {
    setAdditionalFields(additionalFields.filter((_, i) => i !== index));
  };

  const handleUpdateAdditionalField = (
    index: number,
    keyOrValue: "key" | "value",
    content: string,
  ) => {
    const newFields = [...additionalFields];
    newFields[index][keyOrValue] = content;
    setAdditionalFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: JobCreationInput = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      contactEmail: formData.get("contactEmail") as string,
      description: formData.get("description") as string,
      schoolId: job.school?.id || "",
    };

    const reservedKeys = [
      "name",
      "description",
      "schoolId",
      "type",
      "contactEmail",
    ];
    for (const field of additionalFields) {
      const key = field.key.trim();
      if (key && !reservedKeys.includes(key.toLowerCase())) {
        data[key] = field.value;
      }
    }

    await onSubmit(data);
  };

  const jobTypes = ["CDI", "CDD", "Internship", "Freelance", "Other"];

  return (
    <div className="space-y-6">
      <form id="edit-job-form" onSubmit={handleSubmit} className="space-y-6">
        {updateError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {updateError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-bold text-zinc-700 dark:text-zinc-300"
            >
              Job Title
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={job.name}
              required
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-bold text-zinc-700 dark:text-zinc-300"
            >
              Job Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={job.type}
              required
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-50"
            >
              <option value="">Select a type...</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="contactEmail"
              className="block text-sm font-bold text-zinc-700 dark:text-zinc-300"
            >
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              defaultValue={job.contactEmail}
              required
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-50"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-bold text-zinc-700 dark:text-zinc-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            defaultValue={job.details}
            required
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none resize-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-50"
          />
        </div>

        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              Additional Information
            </h3>
            <button
              type="button"
              onClick={handleAddAdditionalField}
              className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 px-3 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              + Add Field
            </button>
          </div>

          <div className="space-y-3">
            {additionalFields.map((field, index) => {
              const fieldId = `field-${job.id}-${index}`;
              return (
                <div key={fieldId} className="flex items-start gap-3 group">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Key (e.g. Salary)"
                      value={field.key}
                      onChange={(e) =>
                        handleUpdateAdditionalField(
                          index,
                          "key",
                          e.target.value,
                        )
                      }
                      className="px-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-50"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) =>
                        handleUpdateAdditionalField(
                          index,
                          "value",
                          e.target.value,
                        )
                      }
                      className="px-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalField(index)}
                    className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove field"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Remove field</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
            {additionalFields.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                No additional fields added.
              </p>
            )}
          </div>
        </div>
      </form>
      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 -mx-8 -mb-8 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-zinc-600 font-bold hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Cancel
        </button>
        <button
          form="edit-job-form"
          type="submit"
          disabled={isUpdating}
          className="px-8 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
