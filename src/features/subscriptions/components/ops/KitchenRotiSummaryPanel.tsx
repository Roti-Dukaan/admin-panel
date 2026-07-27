"use client";

import { useQuery } from "@tanstack/react-query";
import { ChefHat } from "lucide-react";
import { subscriptionsApi } from "@/features/subscriptions/services/subscriptions.api";

const ROTI_LABELS: Record<string, string> = {
  JOWAR: "Jowar",
  RAGI: "Ragi",
  WHEAT: "Wheat",
  OTHERS: "Others",
};

export function KitchenRotiSummaryPanel({ date }: { date: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["kitchen-roti-summary", date],
    queryFn: () => subscriptionsApi.getKitchenSummary(date),
  });

  if (isLoading) {
    return <div className="py-6 text-center text-sm text-muted-foreground">Loading roti totals…</div>;
  }

  if (!data) return null;

  const rotiTotals = (data.rotiTypeTotals ?? []) as Array<{ rotiType: string; quantity: number }>;
  const bySlot = (data.bySlot ?? []) as Array<{
    slotName: string;
    deliveryCount: number;
    rotiTypeTotals?: Array<{ rotiType: string; quantity: number }>;
  }>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
            Roti Production by Type
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {rotiTotals.length === 0 ? (
            <p className="col-span-full text-sm text-gray-500">No roti totals for this date.</p>
          ) : (
            rotiTotals.map((row) => (
              <div key={row.rotiType} className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{row.quantity}</p>
                <p className="text-xs text-gray-500">{ROTI_LABELS[row.rotiType] ?? row.rotiType}</p>
              </div>
            ))
          )}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {data.totalDeliveries ?? 0} subscription deliveries scheduled
        </p>
      </div>

      {bySlot.map((slot) => (
        <div key={slot.slotName} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">{slot.slotName}</h4>
            <span className="text-xs text-gray-500">{slot.deliveryCount} deliveries</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(slot.rotiTypeTotals ?? []).map((row) => (
              <span
                key={row.rotiType}
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800"
              >
                {ROTI_LABELS[row.rotiType] ?? row.rotiType}: {row.quantity}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
