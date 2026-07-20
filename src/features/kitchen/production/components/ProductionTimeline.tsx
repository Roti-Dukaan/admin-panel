"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusBadge } from "./MealSlotSection";
import type { ProductionBatch } from "../types";

export function ProductionTimeline({ batches }: { batches: ProductionBatch[] }) {
  const ordered = [...batches].sort((a, b) =>
    a.scheduledStartTime.localeCompare(b.scheduledStartTime),
  );

  if (ordered.length === 0) {
    return <p className="text-sm text-muted-foreground">No production activity for this day yet.</p>;
  }

  return (
    <div className="space-y-3">
      {ordered.map((b) => {
        const totalRequired = b.items.reduce((s, i) => s + i.requiredQuantity, 0);
        const totalPrepared = b.items.reduce((s, i) => s + i.preparedQuantity, 0);
        const pct = totalRequired > 0 ? Math.round((totalPrepared / totalRequired) * 100) : 0;
        return (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base">{b.name}</CardTitle>
              {statusBadge(b.status)}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="capitalize">{b.mealSlot}</span>
                <span>·</span>
                <span>{b.scheduledStartTime}</span>
                <span>·</span>
                <span>Prepared {totalPrepared}/{totalRequired} ({pct}%)</span>
                <span>·</span>
                <Badge className="bg-gray-100 text-gray-600">{b.items.length} items</Badge>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
