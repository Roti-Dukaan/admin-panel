"use client";

import { motion } from "motion/react";
import {
  ShoppingBag,
  UserPlus,
  CreditCard,
  Banknote,
  Clock,
} from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

const TYPE_CONFIG = {
  order: { icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
  registration: { icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" },
  subscription: { icon: CreditCard, color: "text-violet-600", bg: "bg-violet-50" },
  payment: { icon: Banknote, color: "text-orange-600", bg: "bg-orange-50" },
};

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivity() {
  const activity = useReportsStore((s) => s.data.recentActivity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.55 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
          <Clock className="h-4 w-4 text-gray-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
      </div>

      <div className="space-y-2">
        {activity.map((item, i) => {
          const config = TYPE_CONFIG[item.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.6 + i * 0.03 }}
              className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50/50 transition-colors"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{item.title}</p>
                <p className="text-[11px] text-gray-500 truncate">{item.description}</p>
              </div>
              <div className="text-right shrink-0">
                {item.amount && (
                  <p className="text-xs font-bold text-gray-900">₹{item.amount.toLocaleString()}</p>
                )}
                <p className="text-[10px] text-gray-400">{formatTimeAgo(item.timestamp)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
