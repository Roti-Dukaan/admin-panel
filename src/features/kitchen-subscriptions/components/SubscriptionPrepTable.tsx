"use client";

import { ChefHat, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SubscriptionPrepRow } from "../types/kitchen-subscriptions";
import {
  ROTI_TYPE_LABELS,
  PREP_STATUS_META,
  PACKING_STATUS_META,
  DISPATCH_STATUS_META,
} from "../types/kitchen-subscriptions";

function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>
      {label}
    </span>
  );
}

function RotiList({ items }: { items: SubscriptionPrepRow["selectedRotis"] }) {
  if (items.length === 0) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="space-y-0.5">
      {items.map((item, idx) => (
        <p key={`${item.name}-${idx}`} className="text-xs text-gray-700">
          {item.quantity}× {item.name}
          {item.rotiType ? ` (${ROTI_TYPE_LABELS[item.rotiType] ?? item.rotiType})` : ""}
        </p>
      ))}
    </div>
  );
}

export function SubscriptionPrepTable({
  rows,
  onPrep,
  onPack,
  onDispatch,
  updatingId,
  isLoading,
}: {
  rows: SubscriptionPrepRow[];
  onPrep: (id: string) => void;
  onPack: (id: string) => void;
  onDispatch: (id: string) => void;
  updatingId: string | null;
  isLoading: boolean;
}) {
  if (isLoading && rows.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
        Loading subscription prep list…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-700">No active subscription deliveries</p>
        <p className="mt-1 text-xs text-gray-500">
          Skipped, paused, and cancelled deliveries are excluded from prep counts.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Area / Address</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Selected Rotis</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Prep</TableHead>
              <TableHead>Packing</TableHead>
              <TableHead>Dispatch</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const prepMeta = PREP_STATUS_META[row.prepStatus] ?? PREP_STATUS_META.OTHER;
              const packMeta = PACKING_STATUS_META[row.packingStatus] ?? PACKING_STATUS_META.PENDING;
              const dispatchMeta = DISPATCH_STATUS_META[row.dispatchStatus] ?? DISPATCH_STATUS_META.PENDING;
              const isUpdating = updatingId === row.id;

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="min-w-[120px]">
                      <p className="text-sm font-medium text-gray-900">{row.customerName}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        Subscription
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-600">{row.customerPhone || "—"}</TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="truncate text-sm font-medium text-gray-800">{row.area || "—"}</p>
                    <p className="truncate text-xs text-gray-500">{row.address || "—"}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-700">
                    <p>{row.deliverySlotName ?? "—"}</p>
                    {row.deliverySlotStart && row.deliverySlotEnd && (
                      <p className="text-xs text-gray-400">
                        {row.deliverySlotStart} – {row.deliverySlotEnd}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    <RotiList items={row.selectedRotis} />
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums">{row.totalQuantity}</TableCell>
                  <TableCell className="max-w-[140px] truncate text-xs text-gray-500">{row.notes || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge label={prepMeta.label} className={prepMeta.className} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={packMeta.label} className={packMeta.className} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={dispatchMeta.label} className={dispatchMeta.className} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {row.prepStatus === "PENDING" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => onPrep(row.id)}
                          className="h-8 gap-1"
                        >
                          <ChefHat className="h-3.5 w-3.5" />
                          Prep
                        </Button>
                      )}
                      {row.prepStatus === "PREPARING" && row.packingStatus !== "PACKED" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => onPack(row.id)}
                          className="h-8 gap-1"
                        >
                          <Package className="h-3.5 w-3.5" />
                          Pack
                        </Button>
                      )}
                      {row.dispatchStatus === "READY" && (
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700"
                          disabled={isUpdating}
                          onClick={() => onDispatch(row.id)}
                        >
                          <Truck className="h-3.5 w-3.5" />
                          Handover
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
