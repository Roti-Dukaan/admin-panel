"use client";

import { Truck, Package, CheckCircle2, Clock, Users, AlertCircle } from "lucide-react";
import type { DispatchDashboard } from "../types/dispatch";

interface Props {
  data: DispatchDashboard | undefined;
  isLoading: boolean;
}

const stats = [
  { key: "pendingDispatch" as const, label: "Pending Dispatch", icon: Clock, color: "text-gray-600", bg: "bg-gray-100" },
  { key: "assigned" as const, label: "Assigned", icon: Users, color: "text-violet-600", bg: "bg-violet-100" },
  { key: "pickedUp" as const, label: "Picked Up", icon: Truck, color: "text-amber-600", bg: "bg-amber-100" },
  { key: "completed" as const, label: "Completed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
  { key: "failed" as const, label: "Failed", icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  { key: "todayDispatches" as const, label: "Today's Dispatches", icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
];

export function DispatchStats({ data, isLoading }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((s) => (
        <div key={s.key} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <span className="text-xs font-medium text-gray-500">{s.label}</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
            {isLoading ? "—" : data?.[s.key] ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}
