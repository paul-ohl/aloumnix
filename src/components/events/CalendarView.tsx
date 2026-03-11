"use client";

import { useState } from "react";
import type { SerializedEvent } from "./types";

interface CalendarViewProps {
  events: SerializedEvent[];
  onView: (event: SerializedEvent) => void;
}

export function CalendarView({ events, onView }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay(); // 0 is Sunday

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days: (number | null)[] = [];
  // Add empty slots for days of the week before the 1st
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Fill the rest of the grid with nulls to make it always 6 rows if we want, or just let it be.
  // Actually, let's keep it simple.

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const d = new Date(event.datetime);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  const today = new Date();
  const isThisMonth =
    today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Calendar Icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400"
            aria-label="Previous month"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Previous</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm font-bold text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400"
            aria-label="Next month"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Next</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-4 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-zinc-100/20 dark:bg-zinc-800/20">
        {days.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isToday = isThisMonth && day === today.getDate();
          const dayKey = day ? `day-${day}` : `empty-${index}`;

          return (
            <div
              key={dayKey}
              className={`min-h-[120px] p-2 border-r border-b border-zinc-100 dark:border-zinc-800 relative transition-colors ${
                day ? "bg-white dark:bg-zinc-900" : "bg-transparent"
              } ${
                dayEvents.length > 0
                  ? "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                  : ""
              }`}
            >
              {day && (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-sm font-bold flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                        isToday
                          ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 shadow-md shadow-zinc-900/10 dark:shadow-zinc-50/10"
                          : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50"
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="flex h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onView(event)}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] leading-tight font-bold bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:scale-[1.02] active:scale-95 transition-all truncate"
                        title={`${new Date(event.datetime).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )} - ${event.name}`}
                      >
                        {event.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
