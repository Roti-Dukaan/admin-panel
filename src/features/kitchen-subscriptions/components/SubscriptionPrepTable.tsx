"use client";

import { ChefHat, Package, Printer } from "lucide-react";
import { formatDeliverySlotLabel } from "@/lib/delivery-slot-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AssignableStaff, DriverDeliveryStop } from "@/features/delivery-boys/types/delivery-boys";
import type { SubscriptionPrepRow } from "../types/kitchen-subscriptions";
import { SubscriptionPrepDispatchActions } from "./SubscriptionPrepDispatchActions";
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

function MenuList({ items }: { items: SubscriptionPrepRow["selectedRotis"] }) {
  if (items.length === 0) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="space-y-0.5">
      {items.map((item, idx) => (
        <p key={`${item.name}-${idx}`} className="text-xs text-gray-700">
          {item.quantity}× {item.name}
          {item.rotiType ? ` (${ROTI_TYPE_LABELS[item.rotiType] ?? item.rotiType})` : ""}
          {item.isDefault ? (
            <span className="ml-1 text-[10px] font-medium text-amber-600">(default)</span>
          ) : null}
        </p>
      ))}
    </div>
  );
}

export function SubscriptionPrepTable({
  rows,
  onPrep,
  onPack,
  onPrintTicket,
  updatingId,
  isLoading,
  staff,
  dispatchById,
  assignBusyId,
  onAssign,
  onAssignSelf,
  onUnassign,
  onReassign,
}: {
  rows: SubscriptionPrepRow[];
  onPrep: (id: string) => void;
  onPack: (id: string) => void;
  onPrintTicket: (row: SubscriptionPrepRow) => void;
  updatingId: string | null;
  isLoading: boolean;
  staff: AssignableStaff[];
  dispatchById: Map<string, DriverDeliveryStop>;
  assignBusyId: string | null;
  onAssign: (deliveryId: string, assigneeUserId: string) => Promise<void>;
  onAssignSelf: (deliveryId: string) => Promise<void>;
  onUnassign: (deliveryId: string) => Promise<void>;
  onReassign: (deliveryId: string, assigneeUserId: string) => Promise<void>;
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
              <TableHead>Delivery ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Area / Address</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Selected Menu</TableHead>
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
              const dispatchInfo = dispatchById.get(row.id);
              const showAssignActions = row.packingStatus === "PACKED" && row.dispatchStatus !== "DELIVERED";

              return (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-gray-700">
                    {row.deliveryNumber ?? "—"}
                  </TableCell>
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
                        {formatDeliverySlotLabel(row.deliverySlotStart, row.deliverySlotEnd)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    <MenuList items={row.selectedRotis} />
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
                    <div className="space-y-1">
                      <StatusBadge label={dispatchMeta.label} className={dispatchMeta.className} />
                      {dispatchInfo?.assigneeName ? (
                        <p className="text-[11px] font-medium text-indigo-700">
                          {dispatchInfo.assigneeName}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1.5">
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
                      {row.prepStatus === "PREPARING" && row.packingStatus !== "PACKED" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={isUpdating}
                            onClick={() => onPrintTicket(row)}
                            className="h-8 gap-1"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print Ticket
                          </Button>
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
                        </>
                      ) : null}
                      {showAssignActions ? (
                        <SubscriptionPrepDispatchActions
                          row={row}
                          dispatchInfo={dispatchInfo}
                          staff={staff}
                          busy={assignBusyId === row.id}
                          onAssign={onAssign}
                          onAssignSelf={onAssignSelf}
                          onUnassign={onUnassign}
                          onReassign={onReassign}
                        />
                      ) : null}
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
