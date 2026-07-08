"use client";

import { motion } from "motion/react";
import { CheckCircle, XCircle, Clock, Timer, Truck } from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

export function OrdersChart() {
  const analytics = useReportsStore((s) => s.data.orderAnalytics);

  const stats = [
    { label: "Completed", value: analytics.completed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Cancelled", value: analytics.cancelled, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
    { label: "Pending", value: analytics.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Avg Prep Time", value: `${analytics.avgPrepTime}m`, icon: Timer, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Avg Delivery", value: `${analytics.avgDeliveryTime}m`, icon: Truck, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const completionRate = analytics.totalOrders > 0
    ? Math.round((analytics.completed / analytics.totalOrders) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Order Analytics</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-gray-500">{completionRate}% completion rate</span>
        </div>
      </div>

      <div className="space-y-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 + i * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-gray-100 p-3.5 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{stat.label}</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Order Status Distribution</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          <div
            className="bg-emerald-500 transition-all"
            style={{ width: `${(analytics.completed / analytics.totalOrders) * 100}%` }}
          />
          <div
            className="bg-amber-400 transition-all"
            style={{ width: `${(analytics.pending / analytics.totalOrders) * 100}%` }}
          />
          <div
            className="bg-red-400 transition-all"
            style={{ width: `${(analytics.cancelled / analytics.totalOrders) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-gray-500">Completed ({analytics.completed})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-gray-500">Pending ({analytics.pending})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-[11px] text-gray-500">Cancelled ({analytics.cancelled})</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
