"use client";

import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductionItem {
  name: string;
  emoji: string;
  required: number;
  prepared: number;
}

export function ProductionSummary({ items }: { items: ProductionItem[] }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ChefHat className="h-4 w-4 text-orange-500" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">Production Summary</h2>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No active items</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const pct = item.required > 0 ? Math.round((item.prepared / item.required) * 100) : 0;
            return (
              <li key={item.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span>{item.emoji}</span>
                    <span className="truncate font-medium text-gray-800">{item.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-gray-500">
                    {item.prepared}/{item.required}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      pct >= 100 ? "bg-emerald-500" : pct > 0 ? "bg-amber-500" : "bg-gray-300"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
