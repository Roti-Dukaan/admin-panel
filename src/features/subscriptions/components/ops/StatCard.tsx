"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "info" | "destructive";
  icon?: LucideIcon;
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-emerald-600",
    warning: "text-amber-600",
    info: "text-sky-600",
    destructive: "text-red-600",
  }[tone];
  const tintClass = {
    default: "bg-gray-50 text-gray-500 ring-gray-100",
    success: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    warning: "bg-amber-50 text-amber-600 ring-amber-100",
    info: "bg-sky-50 text-sky-600 ring-sky-100",
    destructive: "bg-red-50 text-red-600 ring-red-100",
  }[tone];
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-4">
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tintClass}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={`mt-1 text-2xl font-bold leading-none ${toneClass}`}>{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
