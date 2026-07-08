"use client";

import { motion } from "motion/react";
import { Download, FileSpreadsheet, RefreshCw, BarChart3 } from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

export function ReportsHeader() {
  const refreshData = useReportsStore((s) => s.refreshData);
  const loading = useReportsStore((s) => s.loading);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Reports & Analytics
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Track business performance with real-time insights.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Download PDF
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">Soon</span>
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">Soon</span>
        </button>
        <button
          onClick={refreshData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </motion.div>
  );
}
