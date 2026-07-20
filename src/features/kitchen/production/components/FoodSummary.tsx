"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductionPlan } from "../types";

export function FoodSummary({ plan }: { plan?: ProductionPlan }) {
  if (!plan) {
    return <p className="text-sm text-muted-foreground">Loading food summary…</p>;
  }

  // Aggregate quantities per food item across all slots.
  const map = new Map<string, { foodName: string; category: string | null; isVeg: boolean | null; qty: number }>();
  (["breakfast", "lunch", "dinner"] as const).forEach((slot) => {
    for (const it of plan.bySlot[slot]) {
      const cur = map.get(it.foodName) ?? {
        foodName: it.foodName,
        category: it.category,
        isVeg: it.isVeg,
        qty: 0,
      };
      cur.qty += it.requiredQuantity;
      map.set(it.foodName, cur);
    }
  });

  const rows = [...map.values()].sort((a, b) => b.qty - a.qty);
  const rotis = rows
    .filter((r) => /roti|chapati/i.test(r.foodName))
    .reduce((s, r) => s + r.qty, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">{rotis}</div>
            <div className="text-sm text-muted-foreground">Total Rotis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">{plan.summary.vegMeals}</div>
            <div className="text-sm text-muted-foreground">Veg Meals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">{plan.summary.nonVegMeals}</div>
            <div className="text-sm text-muted-foreground">Non-Veg Meals</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Food Consumption (aggregated)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Food Item</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.foodName}-${i}`} className="border-t">
                    <td className="py-2 pr-4 font-medium">{r.foodName}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{r.category ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <Badge className={r.isVeg === null ? "bg-gray-100 text-gray-600" : r.isVeg ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {r.isVeg === null ? "—" : r.isVeg ? "Veg" : "Non-Veg"}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold">{r.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
