"use client";

import { motion } from "motion/react";
import { Calendar } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Calendar className="h-4 w-4 text-gray-400" />
          Date Range
        </div>
        <div className="flex gap-1.5">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setDateRange(opt.key)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                dateRange === opt.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {dateRange === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
