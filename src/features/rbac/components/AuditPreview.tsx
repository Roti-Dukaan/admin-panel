"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  LogIn,
  LogOut,
  Activity,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auditApi } from "@/features/audit/services/audit.api";
import type { AuditLog } from "@/features/audit/types/audit";

const actionConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  create: { icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50" },
  update: { icon: Pencil, color: "text-blue-600", bg: "bg-blue-50" },
  delete: { icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
  login: { icon: LogIn, color: "text-violet-600", bg: "bg-violet-50" },
  logout: { icon: LogOut, color: "text-amber-600", bg: "bg-amber-50" },
};

function formatTimeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function AuditPreview() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    auditApi
      .list({ limit: 8, page: 1 })
      .then((data) => {
        if (active) setLogs(data.items);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Clock className="h-3 w-3" />
          Live
        </div>
      </div>
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-7 w-7 shrink-0 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-2.5 w-16 rounded bg-gray-100" />
              </div>
            </div>
          ))
        ) : logs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            No recent activity
          </p>
        ) : (
          logs.map((log) => {
            const key = log.action.toLowerCase().split("_")[0];
            const config = actionConfig[key] || {
              icon: Activity,
              color: "text-gray-600",
              bg: "bg-gray-50",
            };
            const Icon = config.icon;
            const performer = log.admin?.name || log.admin?.email || "System";
            return (
              <div key={log.id} className="flex items-start gap-3">
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
                    <span className="font-semibold">{performer}</span>{" "}
                    <span className="capitalize">{log.action.toLowerCase()}</span>{" "}
                    {log.entity}
                    {log.entityId ? (
                      <span className="font-mono text-[10px] text-gray-400">
                        {" "}
                        #{log.entityId.slice(0, 8)}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatTimeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
