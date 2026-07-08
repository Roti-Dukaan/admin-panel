"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Clock, AlertTriangle, Package, ChefHat, CheckCircle2, Timer } from "lucide-react";
import { useKitchenStore } from "../hooks/useKitchen";

const statCards = [
  { key: "pending" as const, label: "Pending Orders", icon: Clock, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
  { key: "preparing" as const, label: "Preparing", icon: ChefHat, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
  { key: "ready" as const, label: "Ready", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
  { key: "packed" as const, label: "Packed", icon: Package, color: "text-violet-600", bg: "bg-violet-50", ring: "ring-violet-100" },
  { key: "delayed" as const, label: "Delayed", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", ring: "ring-red-100" },
  { key: "avgPrepTime" as const, label: "Avg Prep Time", icon: Timer, color: "text-gray-600", bg: "bg-gray-50", ring: "ring-gray-100", suffix: " min" },
];

export function KitchenStats() {
  const getStats = useKitchenStore((s) => s.getStats);
  const stats = useMemo(() => getStats(), [getStats]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {statCards.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg} ring-1 ${card.ring}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900">
                  {value}{(card as { suffix?: string }).suffix || ""}
                </p>
                <p className="text-xs font-medium text-gray-500 truncate">{card.label}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
