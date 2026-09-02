"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Banknote, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { usePaymentStore } from "../hooks/usePayments";

function formatCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function CodDashboard() {
  const codRecords = usePaymentStore((s) => s.codRecords);
  const getCodStats = usePaymentStore((s) => s.getCodStats);
  const stats = useMemo(() => getCodStats(), [codRecords, getCodStats]);

  const cards = [
    { label: "COD Orders Today", value: stats.codOrdersToday, icon: Banknote, color: "text-amber-600", bg: "bg-amber-50", format: "number" as const },
    { label: "Pending Collection", value: stats.codPendingCollection, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", format: "currency" as const },
    { label: "Collected", value: stats.codCollected, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", format: "currency" as const },
    { label: "Outstanding COD", value: stats.outstandingCod, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", format: "currency" as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
          <Banknote className="h-4 w-4 text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Cash on Delivery</h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {card.format === 'currency' ? formatCurrency(card.value) : card.value}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">{card.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
