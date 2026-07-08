"use client";

import { motion } from "motion/react";
import { Users, UserCheck, Repeat, ShoppingCart, Star } from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

export function CustomerInsights() {
  const data = useReportsStore((s) => s.data.customerInsights);

  function formatCurrency(amount: number) {
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  }

  const stats = [
    { label: "Repeat Customers", value: data.repeatCustomers.toLocaleString(), icon: Repeat, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "First-Time Customers", value: data.firstTimeCustomers.toLocaleString(), icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Customer Retention", value: `${data.customerRetention}%`, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Avg Orders/Customer", value: data.avgOrdersPerCustomer.toFixed(1), icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.45 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
          <Users className="h-4 w-4 text-pink-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Customer Insights</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.5 + i * 0.04 }}
            className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
              <p className="text-sm font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Star className="h-3 w-3 text-amber-400" /> Top Spending Customers
        </h4>
        <div className="space-y-2">
          {data.topSpendingCustomers.map((customer, i) => (
            <motion.div
              key={customer.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.55 + i * 0.04 }}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{customer.name}</p>
                  <p className="text-[10px] text-gray-400">{customer.orders} orders</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-700">{formatCurrency(customer.spend)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
