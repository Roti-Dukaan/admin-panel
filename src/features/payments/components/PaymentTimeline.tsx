"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { CheckCircle, Clock, Circle } from "lucide-react";
import type { PaymentTimelineEvent } from "../types/payment";

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EVENT_ICONS: Record<string, typeof CheckCircle> = {
  order_created: CheckCircle,
  payment_initiated: Clock,
  payment_authorized: CheckCircle,
  payment_successful: CheckCircle,
  order_accepted: CheckCircle,
  preparing: Clock,
  out_for_delivery: Clock,
  delivered: CheckCircle,
};

export function PaymentTimeline({ events }: { events: PaymentTimelineEvent[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <h3 className="text-base font-bold text-gray-900 mb-5">Payment Timeline</h3>
      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />
        <div className="space-y-4">
          {events.map((event, i) => {
            const Icon = EVENT_ICONS[event.type] || Circle;
            const isCompleted = event.status === 'completed';
            const isCurrent = event.status === 'current';
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                className="relative flex items-start gap-4"
              >
                <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-600'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className={`text-sm font-semibold ${
                    isCompleted ? 'text-gray-900' : isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {event.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {formatDateTime(event.timestamp)}
                  </p>
                </div>
                {isCurrent && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase">
                    Current
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
