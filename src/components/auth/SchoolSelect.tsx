"use client";

interface School {
  id: string;
  name: string;
  location: string;
}

interface SchoolSelectProps {
  schools: School[];
  selectedId?: string;
  onChange?: (id: string) => void;
  error?: string;
}

export function SchoolSelect({
  schools,
  selectedId,
  onChange,
  error,
}: SchoolSelectProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="schoolId"
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Select your school
      </label>
      <select
        id="schoolId"
        name="schoolId"
        value={selectedId}
        onChange={(e) => onChange?.(e.target.value)}
        className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
      >
        <option value="">-- Choose a school --</option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name} - {school.location}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
