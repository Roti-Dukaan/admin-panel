"use client";

import { useState } from "react";
import { Plus, Trash2, Clock, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateBatch,
  useAddBatchItem,
  useUpdatePrepared,
  useUpdateBatchStatus,
  useDeleteBatch,
  useCanUpdatePrepared,
} from "../useKitchenProduction";
import { statusBadge } from "./MealSlotSection";
import type { ProductionBatch, MealSlot, ProductionBatchStatus } from "../types";

const MEALS: MealSlot[] = ["breakfast", "lunch", "dinner"];

export function BatchManager({
  date,
  batches,
  canManage,
}: {
  date: string;
  batches: ProductionBatch[];
  canManage: boolean;
}) {
  const [name, setName] = useState("");
  const [mealSlot, setMealSlot] = useState<MealSlot>("breakfast");
  const [startTime, setStartTime] = useState("06:00");
  const createBatch = useCreateBatch();

  return (
    <div className="space-y-4">
      {canManage && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border pb-3">
            <Plus className="h-4 w-4 text-teal-600" />
            <CardTitle className="text-base">Create Production Batch</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[180px] flex-1">
                <div className="mb-1 text-xs text-muted-foreground">Name</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Batch 1 - Breakfast" />
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Meal</div>
                <Select value={mealSlot} onValueChange={(v) => setMealSlot(v as MealSlot)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEALS.map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Start Time</div>
                <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="06:00" className="w-28" />
              </div>
              <Button
                disabled={!name || createBatch.isPending}
                onClick={() => {
                  createBatch.mutate(
                    { date, name, mealSlot, scheduledStartTime: startTime },
                    { onSuccess: () => setName("") },
                  );
                }}
              >
                <Plus className="h-4 w-4" /> Create Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {batches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <UtensilsCrossed className="h-7 w-7 text-gray-300" />
            <p className="text-sm text-muted-foreground">No batches yet for this day.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {batches.map((b) => (
            <BatchCard key={b.id} batch={b} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}

function BatchCard({ batch, canManage }: { batch: ProductionBatch; canManage: boolean }) {
  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("0");
  const addItem = useAddBatchItem();
  const updatePrepared = useUpdatePrepared();
  const updateStatus = useUpdateBatchStatus();
  const deleteBatch = useDeleteBatch();
  const canUpdate = useCanUpdatePrepared();

  const totalRequired = batch.items.reduce((s, i) => s + i.requiredQuantity, 0);
  const totalPrepared = batch.items.reduce((s, i) => s + i.preparedQuantity, 0);
  const pct = totalRequired > 0 ? Math.round((totalPrepared / totalRequired) * 100) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 border-b border-border pb-3">
        <div>
          <CardTitle className="text-base">{batch.name}</CardTitle>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 capitalize">
              <Clock className="h-3 w-3" /> {batch.scheduledStartTime}
            </span>
            <span className="capitalize">{batch.mealSlot}</span>
            {statusBadge(batch.status)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <Select
              value={batch.status}
              onValueChange={(v) => updateStatus.mutate({ batchId: batch.id, dto: { status: v as ProductionBatchStatus } })}
            >
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["PENDING", "COOKING", "COMPLETED", "CANCELLED"] as ProductionBatchStatus[]).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s.toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {canManage && (
            <Button variant="outline" size="icon" onClick={() => deleteBatch.mutate(batch.id)} aria-label="Delete batch">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Batch progress</span>
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
                <th className="py-2 pr-3 font-medium">Food Item</th>
                <th className="py-2 pr-3 text-right font-medium">Req.</th>
                <th className="py-2 pr-3 text-right font-medium">Prep.</th>
                <th className="py-2 pr-3 text-right font-medium">Left</th>
                <th className="py-2 pr-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {batch.items.map((it) => (
                <tr key={it.id} className="border-t border-border/60 last:border-0 hover:bg-muted/40">
                  <td className="py-2 pr-3 font-medium text-foreground">{it.foodName}</td>
                  <td className="py-2 pr-3 text-right">{it.requiredQuantity}</td>
                  <td className="py-2 pr-3 text-right">
                    {canUpdate ? (
                      <Input
                        type="number"
                        defaultValue={it.preparedQuantity}
                        className="w-20 text-right"
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== it.preparedQuantity) {
                            updatePrepared.mutate({ batchId: batch.id, itemId: it.id, dto: { preparedQuantity: v } });
                          }
                        }}
                      />
                    ) : (
                      it.preparedQuantity
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold text-foreground">{it.remainingQuantity}</td>
                  <td className="py-2 pr-3">{statusBadge(it.status)}</td>
                </tr>
              ))}
              {batch.items.length === 0 && (
                <tr><td colSpan={5} className="py-3 text-muted-foreground">No items assigned.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {canManage && (
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
            <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Add food item…" className="max-w-[200px]" />
            <Input value={addQty} onChange={(e) => setAddQty(e.target.value)} type="number" className="w-20" placeholder="Qty" />
            <Button
              size="sm"
              variant="outline"
              disabled={!addName}
              onClick={() => {
                addItem.mutate(
                  { batchId: batch.id, dto: { foodName: addName, requiredQuantity: Number(addQty) || 0 } },
                  { onSuccess: () => { setAddName(""); setAddQty("0"); } },
                );
              }}
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
