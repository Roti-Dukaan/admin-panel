"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import { useKitchenStore } from "../hooks/useKitchen";
import { Priority, PaymentMethod, PRIORITY_CONFIG } from "../types/kitchen";

const quickFilters: { type: "priority" | "paymentMethod"; value: Priority | PaymentMethod; label: string; color: string }[] = [
  { type: "priority", value: "subscription", label: "Subscription", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 data-[active=true]:bg-emerald-600 data-[active=true]:text-white" },
  { type: "priority", value: "express", label: "Express", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 data-[active=true]:bg-red-600 data-[active=true]:text-white" },
  { type: "priority", value: "vip", label: "VIP", color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 data-[active=true]:bg-violet-600 data-[active=true]:text-white" },
  { type: "paymentMethod", value: "cod", label: "COD", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 data-[active=true]:bg-orange-600 data-[active=true]:text-white" },
  { type: "paymentMethod", value: "online", label: "Online", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 data-[active=true]:bg-blue-600 data-[active=true]:text-white" },
];

export function QuickFilters() {
  const filters = useKitchenStore((s) => s.filters);
  const toggleFilter = useKitchenStore((s) => s.toggleFilter);
  const clearFilters = useKitchenStore((s) => s.clearFilters);

  const hasActiveFilters = filters.priority.length > 0 || filters.paymentMethod.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {quickFilters.map((f) => {
        const isActive = filters[f.type].includes(f.value as never);
        return (
          <motion.button
            key={`${f.type}-${f.value}`}
            whileTap={{ scale: 0.95 }}
            data-active={isActive}
            onClick={() => toggleFilter(f.type, f.value)}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${f.color}`}
          >
            {f.label}
          </motion.button>
        );
      })}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
        >
          <X className="h-3 w-3" />
          Clear
        </motion.button>
      )}
    </div>
  );
}
