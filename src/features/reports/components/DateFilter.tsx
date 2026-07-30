"use client";

import { DateRange, DATE_RANGE_OPTIONS } from "../types/report";
import { useReportsStore } from "../hooks/useReports";

export function DateFilter() {
  const dateRange = useReportsStore((s) => s.dateRange);
  const setDateRange = useReportsStore((s) => s.setDateRange);
  const customStartDate = useReportsStore((s) => s.customStartDate);
  const customEndDate = useReportsStore((s) => s.customEndDate);
  const setCustomStartDate = useReportsStore((s) => s.setCustomStartDate);
  const setCustomEndDate = useReportsStore((s) => s.setCustomEndDate);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
          className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-xs font-semibold text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300 transition-colors cursor-pointer"
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {dateRange === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => {
            setCustomEndDate(e.target.value);
            if (customStartDate && e.target.value) void useReportsStore.getState().refreshData();
          }}
            className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
          />
        </div>
      )}
    </div>
  );
}
