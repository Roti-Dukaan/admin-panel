"use client";

import { cn } from "@/lib/utils";
import type { SubscriptionKitchenSummary } from "../types/kitchen-subscriptions";
import { ROTI_TYPE_LABELS } from "../types/kitchen-subscriptions";

export interface SubscriptionStatsData {
  pending: number;
  preparing: number;
  packed: number;
  readyForDispatch: number;
  total: number;
  totalRotis: number;
  totalPacks: number;
}

const STAT_CARDS: {
  key: keyof Pick<SubscriptionStatsData, "pending" | "preparing" | "packed" | "readyForDispatch" | "total" | "totalRotis">;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  { key: "pending", label: "Pending Prep", emoji: "🆕", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "preparing", label: "Preparing", emoji: "👨‍🍳", color: "text-amber-600", bg: "bg-amber-50" },
  { key: "packed", label: "Packed", emoji: "📦", color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "readyForDispatch", label: "Dispatch Ready", emoji: "🚚", color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "total", label: "Active Deliveries", emoji: "🔁", color: "text-gray-700", bg: "bg-gray-50" },
  { key: "totalRotis", label: "Total Rotis", emoji: "🫓", color: "text-orange-600", bg: "bg-orange-50" },
];

export function SubscriptionStats({ stats }: { stats: SubscriptionStatsData }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STAT_CARDS.map((card) => (
        <div
          key={card.key}
          className={cn("flex items-center gap-3 rounded-2xl border border-gray-100 p-4 shadow-sm", card.bg)}
        >
          <span className="text-2xl">{card.emoji}</span>
          <div>
            <p className={cn("text-xl font-bold tabular-nums", card.color)}>{stats[card.key]}</p>
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SubscriptionPrepSummary({ summary }: { summary: SubscriptionKitchenSummary | undefined }) {
  if (!summary) return null;

  const topItems = summary.itemTotals?.length
    ? summary.itemTotals
    : summary.rotiTypeTotals.map((row) => ({
        name: ROTI_TYPE_LABELS[row.rotiType] ?? row.rotiType,
        quantity: row.quantity,
      }));

  const slotItems = (slot: SubscriptionKitchenSummary["bySlot"][number]) =>
    slot.itemTotals?.length
      ? slot.itemTotals
      : slot.rotiTypeTotals.map((row) => ({
          name: ROTI_TYPE_LABELS[row.rotiType] ?? row.rotiType,
          quantity: row.quantity,
        }));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
          Subscription Prep Summary
        </h2>
        <span className="text-xs text-gray-500">
          {summary.totalPacks} packs · {summary.totalCustomers} customers
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {topItems.length === 0 ? (
          <p className="col-span-full text-sm text-gray-500">No active subscription prep for this date.</p>
        ) : (
          topItems.map((row) => (
            <div key={row.name} className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{row.quantity}</p>
              <p className="text-xs text-gray-500">{row.name}</p>
            </div>
          ))
        )}
      </div>

      {summary.bySlot.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
          {summary.bySlot.map((slot) => (
            <div key={slot.slotId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">{slot.slotName}</p>
                <p className="text-xs text-gray-500">
                  {slot.deliveryCount} deliveries · {slot.rotiCount} items
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {slotItems(slot).map((row) => (
                  <span
                    key={row.name}
                    className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800"
                  >
                    {row.quantity} {row.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
