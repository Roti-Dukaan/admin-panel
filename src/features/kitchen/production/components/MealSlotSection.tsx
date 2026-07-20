"use client";

import { Coffee, Sun, Moon, Leaf, Beef } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductionItem, MealSlot } from "../types";

const MEAL_LABEL: Record<MealSlot, { label: string; icon: React.ElementType }> = {
  breakfast: { label: "Breakfast", icon: Coffee },
  lunch: { label: "Lunch", icon: Sun },
  dinner: { label: "Dinner", icon: Moon },
};

const STATUS_META: Record<string, { label: string; variant: "pending" | "warning" | "success" | "info" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "pending" },
  PARTIAL: { label: "In Progress", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  COOKING: { label: "Cooking", variant: "info" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export function statusBadge(status: string) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING;
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

function VegPill({ isVeg }: { isVeg: boolean | null }) {
  if (isVeg === null) return <span className="text-xs text-muted-foreground">—</span>;
  return isVeg ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
      <Leaf className="h-3 w-3" /> Veg
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-100">
      <Beef className="h-3 w-3" /> Non-Veg
    </span>
  );
}

export function MealSlotSection({
  slot,
  items,
}: {
  slot: MealSlot;
  items: ProductionItem[];
}) {
  const { label, icon: Icon } = MEAL_LABEL[slot];
  const totalRequired = items.reduce((s, i) => s + i.requiredQuantity, 0);
  const totalPrepared = items.reduce((s, i) => s + i.preparedQuantity, 0);
  const pct = totalRequired > 0 ? Math.round((totalPrepared / totalRequired) * 100) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b border-border pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </CardTitle>
        <span className="text-xs font-medium text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
            <Coffee className="h-6 w-6 text-gray-300" />
            <p className="text-sm text-muted-foreground">No items for this slot.</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Prepared</span>
                <span className="font-semibold text-foreground">
                  {totalPrepared}/{totalRequired} ({pct}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Food Item</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 text-right font-medium">Required</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={`${it.foodName}-${i}`} className="border-t border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-foreground">{it.foodName}</div>
                        <div className="mt-0.5"><VegPill isVeg={it.isVeg} /></div>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{it.category ?? "—"}</td>
                      <td className="py-2 pr-4 text-right font-semibold text-foreground">{it.requiredQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
