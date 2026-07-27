"use client";

import { cn } from "@/lib/utils";

export interface SubscriptionStatsData {
  preparing: number;
  ready: number;
  readyForDispatch: number;
  total: number;
}

const STAT_CARDS: {
  key: keyof SubscriptionStatsData;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  { key: "preparing", label: "Preparing", emoji: "👨‍🍳", color: "text-amber-600", bg: "bg-amber-50" },
  { key: "ready", label: "Ready", emoji: "✅", color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "readyForDispatch", label: "Ready For Dispatch", emoji: "📦", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "total", label: "Total Subscriptions", emoji: "📊", color: "text-gray-700", bg: "bg-gray-50" },
];

export function SubscriptionStats({ stats }: { stats: SubscriptionStatsData }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_CARDS.map((card) => (
        <div
          key={card.key}
          className={cn("flex items-center gap-3 rounded-2xl border border-gray-100 p-4 shadow-sm", card.bg)}
        >
          <span className="text-2xl">{card.emoji}</span>
          <div>
            <p className={cn("text-xl font-bold tabular-nums", card.color)}>
              {stats[card.key]}
            </p>
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
