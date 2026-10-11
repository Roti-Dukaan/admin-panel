"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bike, Loader2, Package, RefreshCw, Truck, User, Tag } from "lucide-react";
import { DocumentQuickAction } from "@/features/documents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  realtimeDispatchApi,
  type AssignableStaff,
  type RealtimeDispatchItem,
} from "../services/realtime-dispatch.api";
import { useDeliveriesRealtime } from "@/features/delivery/hooks/useDeliveriesRealtime";
import { cn } from "@/lib/utils";

function CodBadge({ item }: { item: RealtimeDispatchItem }) {
  if (item.paymentMethod !== "COD") return null;
  const collected =
    item.codCollectionStatus === "COLLECTED" || item.codCollectionStatus === "MISMATCH";
  const expected = item.codExpectedAmount ?? item.codAmount ?? item.grandTotal;
  return (
    <Badge
      variant={collected ? "default" : "destructive"}
      className="h-5 px-1.5 text-[10px] font-medium leading-none"
    >
      COD ₹{expected}
      {collected ? " · OK" : " · Due"}
    </Badge>
  );
}

function itemsSummary(items: RealtimeDispatchItem["items"]) {
  return items.map((i) => `${i.quantity}× ${i.name}`).join(", ");
}

function DispatchRow({
  item,
  assignees,
  onRefresh,
}: {
  item: RealtimeDispatchItem;
  assignees: AssignableStaff[];
  onRefresh: () => void;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [selectedBoy, setSelectedBoy] = useState("");

  const run = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(msg);
      onRefresh();
      queryClient.invalidateQueries({ queryKey: ["realtime-driver"] });
      queryClient.invalidateQueries({ queryKey: ["driver-route"] });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-lg border border-gray-200 bg-white px-3 py-2 hover:border-gray-300">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 text-xs font-semibold text-gray-900">{item.orderNumber}</span>
          <span className="truncate text-xs text-gray-700">{item.customerName}</span>
          {item.customerPhone && (
            <span className="hidden shrink-0 text-[11px] text-gray-400 sm:inline">
              {item.customerPhone}
            </span>
          )}
          <CodBadge item={item} />
          {item.deliveryStatus === "WAITING_FOR_KITCHEN" && (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-amber-700">
              In kitchen
            </Badge>
          )}
          {item.dispatchMethod && item.dispatchMethod !== "PENDING" && (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {item.dispatchMethod}
            </Badge>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <DocumentQuickAction
            orderId={item.orderId}
            documentType="DELIVERY_LABEL"
            label="Label"
            icon={Tag}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
          />
          {!item.canDispatch && item.trackingUrl && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <a href={item.trackingUrl} target="_blank" rel="noreferrer">
                Track
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p className="min-w-0 flex-1 truncate text-[11px] leading-tight text-gray-500">
          {item.address}
        </p>
        <p className="max-w-[220px] shrink-0 truncate text-[11px] text-gray-600 sm:max-w-xs">
          {itemsSummary(item.items)}
        </p>

        {item.canDispatch && (
          <div className="flex shrink-0 flex-wrap items-center gap-1">
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={busy}
              onClick={() =>
                run(() => realtimeDispatchApi.dispatchBorzo(item.deliveryId), "Sent to Borzo")
              }
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Truck className="mr-1 h-3.5 w-3.5" />
              )}
              Borzo
            </Button>

            <Select value={selectedBoy} onValueChange={setSelectedBoy}>
              <SelectTrigger className="h-7 w-[7.5rem] text-[11px]">
                <SelectValue placeholder="Boy" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs">
                    {a.name ?? a.email} ({a.activeLoad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-2 text-xs"
              disabled={busy || !selectedBoy}
              onClick={() =>
                run(
                  () =>
                    realtimeDispatchApi.dispatchInHouse(item.deliveryId, {
                      assigneeUserId: selectedBoy,
                    }),
                  "Assigned to delivery partner",
                )
              }
            >
              <Bike className="mr-1 h-3.5 w-3.5" />
              Assign
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              disabled={busy}
              onClick={() =>
                run(() => realtimeDispatchApi.assignSelf(item.deliveryId), "Assigned to you")
              }
            >
              <User className="mr-1 h-3.5 w-3.5" />
              Self
            </Button>
          </div>
        )}

        {item.paymentMethod === "COD" && !item.codCollected && item.deliveryStatus === "DELIVERED" && (
          <Button
            size="sm"
            variant="secondary"
            className="h-7 px-2 text-xs"
            disabled={busy}
            onClick={() =>
              run(
                () =>
                  realtimeDispatchApi.updateCodStatus(item.deliveryId, {
                    collectedAmount: item.codAmount ?? item.grandTotal,
                  }),
                "COD marked collected",
              )
            }
          >
            Mark COD
          </Button>
        )}
      </div>
    </article>
  );
}

function DispatchSection({
  title,
  count,
  items,
  assignees,
  onRefresh,
  emptyMessage,
}: {
  title: string;
  count: number;
  items: RealtimeDispatchItem[];
  assignees: AssignableStaff[];
  onRefresh: () => void;
  emptyMessage: string;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
          {count}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <DispatchRow
              key={item.deliveryId}
              item={item}
              assignees={assignees}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function RealtimeDispatchPanel() {
  const [pending, setPending] = useState<RealtimeDispatchItem[]>([]);
  const [active, setActive] = useState<RealtimeDispatchItem[]>([]);
  const [assignees, setAssignees] = useState<AssignableStaff[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [board, staff] = await Promise.all([
        realtimeDispatchApi.getBoard(),
        realtimeDispatchApi.getAssignees(),
      ]);
      setPending(board.pending);
      setActive(board.active);
      setAssignees(staff);
    } catch {
      toast.error("Failed to load dispatch board");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useDeliveriesRealtime(load);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Package className="h-4 w-4 text-orange-600" />
          <h2 className="text-sm font-semibold text-gray-900">Realtime Dispatch</h2>
          <span className="text-xs text-gray-400">
            {pending.length + active.length} total
          </span>
        </div>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={load} disabled={loading}>
          <RefreshCw className={cn("mr-1 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading && pending.length === 0 && active.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          <DispatchSection
            title="Awaiting dispatch"
            count={pending.length}
            items={pending}
            assignees={assignees}
            onRefresh={load}
            emptyMessage="No orders waiting for dispatch."
          />
          <DispatchSection
            title="Active deliveries"
            count={active.length}
            items={active}
            assignees={assignees}
            onRefresh={load}
            emptyMessage="No active dispatches."
          />
        </div>
      )}
    </div>
  );
}
