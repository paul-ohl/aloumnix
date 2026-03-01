"use client";

interface ModeSwitcherProps {
  mode: "manual" | "filter";
  onChange: (mode: "manual" | "filter") => void;
}

/**
 * A toggle component to switch between manual and filtered selection modes.
 * Follows the Zinc palette and accessible tab patterns.
 */
export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Selection mode"
      className="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl w-full sm:w-fit border border-zinc-200/50 dark:border-zinc-700/50"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "manual"}
        aria-controls="manual-panel"
        id="manual-tab"
        onClick={() => onChange("manual")}
        className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 ${
          mode === "manual"
            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
        }`}
      >
        Select manually
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "filter"}
        aria-controls="filter-panel"
        id="filter-tab"
        onClick={() => onChange("filter")}
        className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 ${
          mode === "filter"
            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
        }`}
      >
        Use general filters
      </button>
    </div>
  );
}
