"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Users, CalendarDays, Box } from "lucide-react";
import { auditApi } from "../services/audit.api";
import type { AuditLogStats } from "../types/audit";

export function AuditLogStats() {
  const [stats, setStats] = useState<AuditLogStats | null>(null);

  useEffect(() => {
    auditApi.getStats().then(setStats).catch(console.error);
  }, []);

  const cards = [
    {
      label: "Total Logs",
      value: stats?.totalLogs ?? "—",
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Logs Today",
      value: stats?.logsToday ?? "—",
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Admins",
      value: stats?.uniqueAdmins ?? "—",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Top Entity",
      value: stats?.topEntity ?? "—",
      icon: Box,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
