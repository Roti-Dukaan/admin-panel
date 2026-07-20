"use client";

import { Clock, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusBadge } from "./MealSlotSection";
import type { ProductionBatch } from "../types";

export function ProductionTimeline({ batches }: { batches: ProductionBatch[] }) {
  const ordered = [...batches].sort((a, b) =>
    a.scheduledStartTime.localeCompare(b.scheduledStartTime),
  );

  if (ordered.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <UtensilsCrossed className="h-7 w-7 text-gray-300" />
          <p className="text-sm text-muted-foreground">No production activity for this day yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {ordered.map((b) => {
        const totalRequired = b.items.reduce((s, i) => s + i.requiredQuantity, 0);
        const totalPrepared = b.items.reduce((s, i) => s + i.preparedQuantity, 0);
        const pct = totalRequired > 0 ? Math.round((totalPrepared / totalRequired) * 100) : 0;
        return (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b border-border pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-teal-600" />
                {b.name}
              </CardTitle>
              {statusBadge(b.status)}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 capitalize">
                  <Clock className="h-3 w-3" /> {b.scheduledStartTime}
                </span>
                <span className="capitalize">{b.mealSlot}</span>
                <span>·</span>
                <span>
                  Prepared <span className="font-semibold text-foreground">{totalPrepared}</span>/
                  <span className="font-semibold text-foreground">{totalRequired}</span> ({pct}%)
                </span>
                <Badge variant="secondary" className="capitalize">{b.items.length} items</Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
