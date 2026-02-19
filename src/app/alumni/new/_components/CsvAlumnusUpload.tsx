"use client";

import Link from "next/link";
import Papa from "papaparse";
import { useEffect, useState, useTransition } from "react";
import { bulkCreateAlumniAction } from "@/app/actions/alumni";
import type { AlumnusInput } from "@/lib/validation/alumni";

const REQUIRED_HEADERS = ["fullName", "mail", "graduationYear", "schoolSector"];

interface Props {
  schoolId: string;
}

export function CsvAlumnusUpload({ schoolId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    success?: boolean;
    count?: number;
    error?: string;
    rowErrors?: { index: number; errors: Record<string, string[]> }[];
  } | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (uploadResult?.success) {
      timeoutId = setTimeout(() => setUploadResult(null), 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [uploadResult]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeaderError(null);
    setUploadResult(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

        if (missing.length > 0) {
          setHeaderError(`Missing required columns: ${missing.join(", ")}`);
          setData([]);
        } else {
          setData(results.data);
        }
      },
    });
  };

  const handleProcess = () => {
    if (data.length === 0) return;

    const alumniToCreate: AlumnusInput[] = data.map((row) => {
      const gradYear = Number(row.graduationYear);
      return {
        fullName: row.fullName?.trim() || "",
        graduationYear: Number.isNaN(gradYear) ? 0 : gradYear,
        class: row.class?.trim() || undefined,
        schoolSector: row.schoolSector?.trim() || "",
        mail: row.mail?.trim() || "",
        linkedInProfile: row.linkedInProfile?.trim() || undefined,
        professionalStatus: row.professionalStatus?.trim() || undefined,
        schoolId: schoolId,
      };
    });

    startTransition(async () => {
      const result = await bulkCreateAlumniAction(alumniToCreate);
      setUploadResult(result as typeof uploadResult);
      if (result.success) {
        setData([]);
      }
    });
  };

  const downloadTemplate = () => {
    const template =
      "fullName,mail,graduationYear,class,schoolSector,professionalStatus,linkedInProfile\nJohn Doe,john@example.com,2023,Class A,Computer Science,Software Engineer,https://linkedin.com/in/johndoe";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alumni_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Bulk CSV Upload</h2>
          <p className="text-zinc-500 text-sm">
            Upload a CSV file to add multiple students at once.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          type="button"
          className="inline-flex items-center text-sm font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Template
        </button>
      </header>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:border-zinc-300 transition-colors bg-zinc-50/50">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-zinc-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-zinc-900 font-medium">
                Click to upload CSV
              </span>
              <span className="text-zinc-500 text-xs mt-1">
                or drag and drop your file here
              </span>
            </div>
          </label>
        </div>

        {headerError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex items-start">
            <svg
              className="w-5 h-5 mr-3 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{headerError}</span>
          </div>
        )}

        {data.length > 0 && !headerError && (
          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-xl shadow-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">
                {data.length} students ready to import
              </span>
            </div>
            <button
              onClick={handleProcess}
              type="button"
              disabled={isPending}
              className="bg-white text-zinc-900 px-6 py-2 rounded-lg font-bold hover:bg-zinc-100 disabled:opacity-50 transition-all active:scale-95"
            >
              {isPending ? "Processing..." : "Start Import"}
            </button>
          </div>
        )}

        {uploadResult?.success && (
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                Success! {uploadResult.count} students imported successfully.
              </span>
            </div>
            <Link
              href="/alumni"
              className="text-green-900 hover:underline font-bold"
            >
              View Alumni List →
            </Link>
          </div>
        )}

        {uploadResult?.error && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 text-sm flex items-start shadow-sm">
              <svg
                className="w-6 h-6 mr-3 text-red-500 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-bold mb-1">Upload failed</p>
                <p>{uploadResult.error}</p>
              </div>
            </div>

            {uploadResult.rowErrors && uploadResult.rowErrors.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Row Errors
                  </span>
                </div>
                <ul className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
                  {uploadResult.rowErrors.map((rowErr) => (
                    <li
                      key={`row-err-${rowErr.index}`}
                      className="p-3 text-sm flex items-start"
                    >
                      <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded mr-3 text-xs">
                        Row {rowErr.index}
                      </span>
                      <div className="text-zinc-600">
                        {Object.entries(rowErr.errors).map(([field, msgs]) => (
                          <div key={field} className="mb-1 last:mb-0">
                            <span className="font-medium text-zinc-900 capitalize">
                              {field}:
                            </span>{" "}
                            {msgs.join(", ")}
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
