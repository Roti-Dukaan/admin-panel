"use client";

import { useRoleStore } from "../hooks/useRoles";
import {
  Plus,
  Pencil,
  Users,
  UserMinus,
  Archive,
  Copy,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actionConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  role_created: { icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50" },
  permission_updated: {
    icon: Pencil,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  user_assigned: { icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  user_removed: {
    icon: UserMinus,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  role_archived: {
    icon: Archive,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  role_cloned: { icon: Copy, color: "text-cyan-600", bg: "bg-cyan-50" },
  role_deleted: { icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
};

function formatTimeAgo(ts: number) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function AuditPreview() {
  const auditEntries = useRoleStore((s) => s.auditEntries);
  const recentEntries = auditEntries.slice(0, 8);

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Clock className="h-3 w-3" />
          Last 30 days
        </div>
      </div>
      <div className="space-y-3">
        {recentEntries.map((entry) => {
          const config = actionConfig[entry.action] || actionConfig.role_created;
          const Icon = config.icon;
          return (
            <div key={entry.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  config.bg
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">{entry.performedBy}</span>{" "}
                  {entry.details}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatTimeAgo(entry.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
