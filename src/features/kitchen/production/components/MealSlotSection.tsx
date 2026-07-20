"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductionItem, MealSlot } from "../types";

const MEAL_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-gray-100 text-gray-600" },
  PARTIAL: { label: "In Progress", cls: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-100 text-emerald-700" },
  COOKING: { label: "Cooking", cls: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
};

export function statusBadge(status: string) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING;
  return <Badge className={meta.cls}>{meta.label}</Badge>;
}

export function MealSlotSection({
  slot,
  items,
}: {
  slot: MealSlot;
  items: ProductionItem[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{MEAL_LABEL[slot]}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items for this slot.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Food Item</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium text-right">Required</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={`${it.foodName}-${i}`} className="border-t">
                    <td className="py-2 pr-4">
                      <div className="font-medium">{it.foodName}</div>
                      <div className="text-xs">{it.isVeg === null ? "" : it.isVeg ? "Veg" : "Non-Veg"}</div>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{it.category ?? "—"}</td>
                    <td className="py-2 pr-4 text-right font-semibold">{it.requiredQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
