"use client";

import { Wheat, Salad, Drumstick, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductionPlan } from "../types";

function SummaryTile({
  icon: Icon,
  value,
  label,
  tint,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  tint: "amber" | "emerald" | "rose";
}) {
  const tintMap = {
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
  } as const;
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tintMap[tint]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xl font-bold leading-none text-foreground">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FoodSummary({ plan }: { plan?: ProductionPlan }) {
  if (!plan) {
    return <p className="text-sm text-muted-foreground">Loading food summary…</p>;
  }

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
        <SummaryTile icon={Wheat} value={rotis} label="Total Rotis" tint="amber" />
        <SummaryTile icon={Salad} value={plan.summary.vegMeals} label="Veg Meals" tint="emerald" />
        <SummaryTile icon={Drumstick} value={plan.summary.nonVegMeals} label="Non-Veg Meals" tint="rose" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 border-b border-border pb-3">
          <ListChecks className="h-4 w-4 text-teal-600" />
          <CardTitle className="text-base">Food Consumption (aggregated)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Food Item</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.foodName}-${i}`} className="border-t border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-medium text-foreground">{r.foodName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.category ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      {r.isVeg === null ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : r.isVeg ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                          Veg
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-100">
                          Non-Veg
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-foreground">{r.qty}</td>
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
