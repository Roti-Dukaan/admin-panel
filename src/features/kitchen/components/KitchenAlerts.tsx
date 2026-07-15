"use client";

import { AlertTriangle, AlarmClock, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KitchenAlert {
  id: string;
  type: "warning" | "danger" | "info" | "success";
  message: string;
}

const ALERT_STYLE: Record<KitchenAlert["type"], { icon: React.ElementType; cls: string }> = {
  danger: { icon: AlertTriangle, cls: "border-red-200 bg-red-50 text-red-700" },
  warning: { icon: AlarmClock, cls: "border-amber-200 bg-amber-50 text-amber-700" },
  info: { icon: Info, cls: "border-sky-200 bg-sky-50 text-sky-700" },
  success: { icon: CheckCircle2, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

export function KitchenAlerts({ alerts }: { alerts: KitchenAlert[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Kitchen Alerts</h2>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          All orders are on track 🎉
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => {
            const { icon: Icon, cls } = ALERT_STYLE[alert.type];
            return (
              <li
                key={alert.id}
                className={cn("flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium", cls)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {alert.message}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
