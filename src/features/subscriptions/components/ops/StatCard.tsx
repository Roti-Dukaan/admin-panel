"use client";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "info" | "destructive";
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-emerald-600",
    warning: "text-amber-600",
    info: "text-sky-600",
    destructive: "text-red-600",
  }[tone];
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
