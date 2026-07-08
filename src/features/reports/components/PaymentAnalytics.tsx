"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Wallet } from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"];

function formatCurrency(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-500">{data.name}</p>
      <p className="text-sm font-bold text-gray-900">{formatCurrency(data.value)}</p>
      <p className="text-[10px] text-gray-400">{((data.value / data.payload.total) * 100).toFixed(1)}%</p>
    </div>
  );
}

export function PaymentAnalytics() {
  const data = useReportsStore((s) => s.data.paymentAnalytics);

  const pieData = useMemo(
    () => [
      { name: "Online", value: data.online, total: data.total, color: COLORS[0] },
      { name: "COD", value: data.cod, total: data.total, color: COLORS[1] },
      { name: "Pending", value: data.pending, total: data.total, color: COLORS[2] },
      { name: "Failed", value: data.failed, total: data.total, color: COLORS[3] },
      { name: "Refunded", value: data.refunded, total: data.total, color: COLORS[4] },
    ],
    [data]
  );

  const legendItems = [
    { label: "Online Payments", value: data.online, color: COLORS[0] },
    { label: "COD Collection", value: data.cod, color: COLORS[1] },
    { label: "Pending", value: data.pending, color: COLORS[2] },
    { label: "Failed", value: data.failed, color: COLORS[3] },
    { label: "Refunded", value: data.refunded, color: COLORS[4] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <Wallet className="h-4 w-4 text-indigo-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Payment Analytics</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {legendItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.45 + i * 0.04 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">{formatCurrency(item.value)}</span>
            </motion.div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Total</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
