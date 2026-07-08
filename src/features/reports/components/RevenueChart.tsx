"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useReportsStore } from "../hooks/useReports";
import { ChartGranularity } from "../types/report";

const GRANULARITY_OPTIONS: { key: ChartGranularity; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

function formatCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {entry.name === "revenue" ? formatCurrency(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart() {
  const granularity = useReportsStore((s) => s.granularity);
  const setGranularity = useReportsStore((s) => s.setGranularity);
  const dailyData = useReportsStore((s) => s.dailyData);
  const weeklyData = useReportsStore((s) => s.weeklyData);
  const monthlyData = useReportsStore((s) => s.monthlyData);

  const chartData = useMemo(() => {
    if (granularity === "weekly") return weeklyData;
    if (granularity === "monthly") return monthlyData;
    return dailyData;
  }, [granularity, dailyData, weeklyData, monthlyData]);

  const totalRevenue = useMemo(
    () => chartData.reduce((sum, d) => sum + d.revenue, 0),
    [chartData]
  );
  const totalOrders = useMemo(
    () => chartData.reduce((sum, d) => sum + d.orders, 0),
    [chartData]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Sales Overview</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Revenue: <span className="font-semibold text-gray-700">{formatCurrency(totalRevenue)}</span>
            <span className="mx-2 text-gray-300">|</span>
            Orders: <span className="font-semibold text-gray-700">{totalOrders.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {GRANULARITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setGranularity(opt.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                granularity === opt.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#f97316"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              name="orders"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="transparent"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
