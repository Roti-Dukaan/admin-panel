"use client";

import { cn } from "@/lib/utils";

export interface KitchenStatsData {
  pending: number;
  preparing: number;
  ready: number;
  total: number;
  delayed: number;
  avgPrep: number;
}

const STAT_CARDS: {
  key: keyof KitchenStatsData;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  suffix?: string;
}[] = [
  { key: "pending", label: "Pending", emoji: "🆕", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "preparing", label: "Preparing", emoji: "👨‍🍳", color: "text-amber-600", bg: "bg-amber-50" },
  { key: "ready", label: "Ready", emoji: "✅", color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "total", label: "Live Orders", emoji: "📊", color: "text-gray-700", bg: "bg-gray-50" },
  { key: "delayed", label: "Delayed", emoji: "⏰", color: "text-red-600", bg: "bg-red-50" },
  { key: "avgPrep", label: "Avg Prep", emoji: "⏱️", color: "text-violet-600", bg: "bg-violet-50", suffix: "m" },
];

export function KitchenStats({ stats }: { stats: KitchenStatsData }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STAT_CARDS.map((card) => (
        <div
          key={card.key}
          className={cn("flex items-center gap-3 rounded-2xl border border-gray-100 p-4 shadow-sm", card.bg)}
        >
          <span className="text-2xl">{card.emoji}</span>
          <div>
            <p className={cn("text-xl font-bold tabular-nums", card.color)}>
              {stats[card.key]}
              {card.suffix ?? ""}
            </p>
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
