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
import { TrendingUp } from "lucide-react";
import { usePaymentStore } from "../hooks/usePayments";

type ChartGranularity = 'daily' | 'weekly';

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
          <span className="font-semibold text-gray-900">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart() {
  const getRevenueTrend = usePaymentStore((s) => s.getRevenueTrend);
  const rawData = useMemo(() => getRevenueTrend(), [getRevenueTrend]);
  const [granularity, setGranularity] = useState<ChartGranularity>('daily');

  const chartData = useMemo(() => {
    if (granularity === 'weekly') {
      const weeks: { label: string; online: number; cod: number; total: number }[] = [];
      for (let i = 0; i < rawData.length; i += 7) {
        const chunk = rawData.slice(i, i + 7);
        weeks.push({
          label: `${chunk[0].label} - ${chunk[chunk.length - 1].label}`,
          online: chunk.reduce((s, d) => s + d.online, 0),
          cod: chunk.reduce((s, d) => s + d.cod, 0),
          total: chunk.reduce((s, d) => s + d.total, 0),
        });
      }
      return weeks;
    }
    return rawData;
  }, [rawData, granularity]);

  const totalRevenue = useMemo(() => chartData.reduce((sum, d) => sum + d.total, 0), [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Revenue Trend</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Total: <span className="font-semibold text-gray-700">{formatCurrency(totalRevenue)}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {(['daily', 'weekly'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setGranularity(opt)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all capitalize ${
                granularity === opt
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="codGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="online" name="Online" stroke="#3b82f6" strokeWidth={2} fill="url(#onlineGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
            <Area type="monotone" dataKey="cod" name="COD" stroke="#f59e0b" strokeWidth={2} fill="url(#codGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
