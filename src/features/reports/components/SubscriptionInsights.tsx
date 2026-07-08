"use client";

import { motion } from "motion/react";
import { CreditCard, Users, RefreshCw, Star, TrendingUp } from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

export function SubscriptionInsights() {
  const data = useReportsStore((s) => s.data.subscriptionInsights);

  function formatCurrency(amount: number) {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  }

  const stats = [
    { label: "Active Plans", value: data.activePlans.toLocaleString(), icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Weekly Subscribers", value: data.weeklySubscribers.toLocaleString(), icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Monthly Subscribers", value: data.monthlySubscribers.toLocaleString(), icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Renewals", value: data.renewals.toLocaleString(), icon: RefreshCw, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Most Popular", value: data.mostPopularPlan, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Churn Rate", value: `${data.churnRate}%`, icon: TrendingUp, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
            <CreditCard className="h-4 w-4 text-teal-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Subscription Insights</h3>
        </div>
        <div className="rounded-xl bg-teal-50 px-3 py-1.5">
          <span className="text-sm font-bold text-teal-700">{formatCurrency(data.subscriptionRevenue)}</span>
          <span className="ml-1 text-[10px] font-medium text-teal-500">revenue</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.35 + i * 0.04 }}
            className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50/50 transition-colors"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[11px] text-gray-500">{stat.label}</p>
              <p className="text-sm font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
