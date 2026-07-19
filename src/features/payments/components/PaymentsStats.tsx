"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  IndianRupee,
  CreditCard,
  Banknote,
  XCircle,
} from "lucide-react";
import { usePaymentStore } from "../hooks/usePayments";

function formatCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

const statCards = [
  {
    key: "todayRevenue" as const,
    label: "Today's Revenue",
    icon: IndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    format: "currency" as const,
  },
  {
    key: "onlinePayments" as const,
    label: "Online Payments",
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-50",
    format: "currency" as const,
  },
  {
    key: "cashOnDelivery" as const,
    label: "Cash on Delivery",
    icon: Banknote,
    color: "text-amber-600",
    bg: "bg-amber-50",
    format: "currency" as const,
  },
  {
    key: "failedPayments" as const,
    label: "Failed Payments",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    format: "currency" as const,
  },
];

export function PaymentsStats() {
  const getStats = usePaymentStore((s) => s.getStats);
  const stats = useMemo(() => getStats(), [getStats]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statCards.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm relative"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={`h-4.5 w-4.5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 truncate">
                  {card.format === 'currency' ? formatCurrency(value) : value.toLocaleString()}
                </p>
                <p className="text-[11px] font-medium text-gray-500 truncate">{card.label}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
