"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, UtensilsCrossed } from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

export function MenuPerformance() {
  const menuData = useReportsStore((s) => s.data.menuPerformance);

  const topRotis = useMemo(
    () => menuData.filter((m) => m.category === "Rotis").sort((a, b) => b.orders - a.orders).slice(0, 3),
    [menuData]
  );
  const topVeg = useMemo(
    () => menuData.filter((m) => m.category === "Veg Curries").sort((a, b) => b.orders - a.orders).slice(0, 3),
    [menuData]
  );
  const topNonVeg = useMemo(
    () => menuData.filter((m) => m.category === "Non-Veg Curries").sort((a, b) => b.orders - a.orders).slice(0, 3),
    [menuData]
  );
  const topCombos = useMemo(
    () => menuData.filter((m) => m.category === "Combos").sort((a, b) => b.orders - a.orders).slice(0, 3),
    [menuData]
  );

  const sections = [
    { title: "Top Rotis", items: topRotis, emoji: "🫓" },
    { title: "Top Veg Curries", items: topVeg, emoji: "🍛" },
    { title: "Top Non-Veg Curries", items: topNonVeg, emoji: "🍗" },
    { title: "Top Combos", items: topCombos, emoji: "🍽️" },
  ];

  function formatCurrency(amount: number) {
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
          <UtensilsCrossed className="h-4 w-4 text-orange-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Menu Performance</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + si * 0.05 }}
          >
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
              {section.emoji} {section.title}
            </h4>
            <div className="space-y-2">
              {section.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-100 text-[10px] font-bold text-gray-500">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">{formatCurrency(item.revenue)}</span>
                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${item.trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {item.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(item.trend)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
