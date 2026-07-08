"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  UserPlus,
  CreditCard,
  Zap,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

const ICON_MAP: Record<string, React.ElementType> = {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  UserPlus,
  CreditCard,
  Zap,
  Banknote,
};

function formatValue(value: number, format: string): string {
  if (format === "currency") {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  }
  if (format === "number") {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }
  if (format === "percent") return `${value}%`;
  return value.toString();
}

export function StatsCards() {
  const kpis = useReportsStore((s) => s.data.kpis);

  const cards = useMemo(() => {
    return kpis.map((kpi) => {
      const Icon = ICON_MAP[kpi.icon] || IndianRupee;
      const change = kpi.previousValue > 0
        ? Math.round(((kpi.value - kpi.previousValue) / kpi.previousValue) * 100)
        : 0;
      const isPositive = change >= 0;
      return { ...kpi, Icon, change, isPositive };
    });
  }, [kpis]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 + i * 0.03 }}
          className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.bgColor}`}>
              <card.Icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <span className="text-xs font-medium text-gray-500 leading-tight">{card.label}</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-xl font-bold text-gray-900">{formatValue(card.value, card.format)}</p>
            <div className={`flex items-center gap-0.5 text-xs font-semibold ${card.isPositive ? "text-emerald-600" : "text-red-500"}`}>
              {card.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(card.change)}%
            </div>
          </div>
          <p className="mt-1 text-[10px] text-gray-400">vs prev. period</p>
        </motion.div>
      ))}
    </div>
  );
}
