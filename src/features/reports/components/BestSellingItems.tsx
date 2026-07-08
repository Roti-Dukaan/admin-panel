"use client";

import { motion } from "motion/react";
import { Award } from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

function formatCurrency(amount: number) {
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export function BestSellingItems() {
  const items = useReportsStore((s) => s.data.bestSellingItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
          <Award className="h-4 w-4 text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Best Selling Items</h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">Top 10</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">#</th>
              <th className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Item</th>
              <th className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Category</th>
              <th className="pb-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">Qty Sold</th>
              <th className="pb-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.55 + i * 0.03 }}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-2.5">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${
                    i < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm">
                      {item.category === "Rotis" ? "🫓" : item.category === "Veg Curries" ? "🍛" : item.category === "Non-Veg Curries" ? "🍗" : "🍽️"}
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{item.name}</span>
                  </div>
                </td>
                <td className="py-2.5">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {item.category}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <span className="text-xs font-semibold text-gray-700">{item.quantitySold.toLocaleString()}</span>
                </td>
                <td className="py-2.5 text-right">
                  <span className="text-xs font-bold text-gray-900">{formatCurrency(item.revenue)}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
