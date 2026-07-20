"use client";

import { useState } from "react";
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Create Production Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              <div>
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
                Create Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {batches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No batches yet for this day.</p>
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{batch.name}</CardTitle>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{batch.mealSlot}</span> · {batch.scheduledStartTime} · {statusBadge(batch.status)}
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
            <Button variant="outline" size="sm" onClick={() => deleteBatch.mutate(batch.id)}>
              Delete
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Food Item</th>
                <th className="py-2 pr-3 font-medium text-right">Required</th>
                <th className="py-2 pr-3 font-medium text-right">Prepared</th>
                <th className="py-2 pr-3 font-medium text-right">Remaining</th>
                <th className="py-2 pr-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {batch.items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="py-2 pr-3 font-medium">{it.foodName}</td>
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
                  <td className="py-2 pr-3 text-right font-semibold">{it.remainingQuantity}</td>
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
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3">
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
              Add Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
