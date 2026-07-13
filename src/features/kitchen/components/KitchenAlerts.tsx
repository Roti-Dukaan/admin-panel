"use client";

import { motion } from "motion/react";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";

interface KitchenAlert {
  id: string;
  type: "warning" | "danger" | "info" | "success";
  message: string;
  timestamp: number;
}

// Static alerts for now - can be replaced with real API when backend endpoint is added
const mockAlerts: KitchenAlert[] = [];

const alertIcons: Record<string, typeof AlertTriangle> = {
  danger: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const alertStyles: Record<string, string> = {
  danger: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function KitchenAlerts() {
  return (
    <div className="space-y-2">
      {mockAlerts.map((alert: KitchenAlert, i: number) => {
        const Icon = alertIcons[alert.type] || Info;
        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${alertStyles[alert.type]}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium flex-1">{alert.message}</span>
            <span className="text-xs opacity-60 shrink-0">
              {Math.round((Date.now() - alert.timestamp) / 60000)}m ago
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
