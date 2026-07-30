"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Bike, Loader2, Package, RefreshCw, Truck, User } from "lucide-react";
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

function CodBadge({ item }: { item: RealtimeDispatchItem }) {
  if (item.paymentMethod !== "COD") return null;
  const collected = item.codCollected != null;
  return (
    <Badge variant={collected ? "default" : "destructive"} className="text-xs">
      COD ₹{item.codAmount ?? item.grandTotal}
      {collected ? " · Collected" : " · Pending"}
    </Badge>
  );
}

function DispatchCard({
  item,
  assignees,
  onRefresh,
}: {
  item: RealtimeDispatchItem;
  assignees: AssignableStaff[];
  onRefresh: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [selectedBoy, setSelectedBoy] = useState("");

  const run = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(msg);
      onRefresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{item.orderNumber}</p>
          <p className="text-sm text-gray-600">{item.customerName}</p>
          <p className="text-xs text-gray-500">{item.address}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <CodBadge item={item} />
          {item.dispatchMethod && item.dispatchMethod !== "PENDING" && (
            <Badge variant="outline">{item.dispatchMethod}</Badge>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        {item.items.map((i, idx) => (
          <span key={idx}>
            {i.quantity}× {i.name}{" "}
          </span>
        ))}
      </div>

      {item.canDispatch && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busy}
            onClick={() => run(() => realtimeDispatchApi.dispatchBorzo(item.deliveryId), "Sent to Borzo")}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="mr-1 h-4 w-4" />}
            Borzo
          </Button>

          <div className="flex items-center gap-1">
            <Select value={selectedBoy} onValueChange={setSelectedBoy}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Delivery boy" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name ?? a.email} ({a.activeLoad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy || !selectedBoy}
              onClick={() =>
                run(
                  () =>
                    realtimeDispatchApi.dispatchInHouse(item.deliveryId, {
                      assigneeUserId: selectedBoy,
                    }),
                  "Assigned to delivery boy",
                )
              }
            >
              <Bike className="mr-1 h-4 w-4" />
              Assign
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              run(() => realtimeDispatchApi.assignSelf(item.deliveryId), "Assigned to you")
            }
          >
            <User className="mr-1 h-4 w-4" />
            Self
          </Button>
        </div>
      )}

      {!item.canDispatch && item.trackingUrl && (
        <a
          href={item.trackingUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-orange-600 underline"
        >
          Track shipment
        </a>
      )}

      {item.paymentMethod === "COD" && !item.codCollected && item.deliveryStatus === "DELIVERED" && (
        <Button
          size="sm"
          className="mt-2"
          variant="secondary"
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
          Mark COD collected
        </Button>
      )}
    </article>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold">Realtime Dispatch</h2>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && pending.length === 0 && active.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <section>
            <h3 className="mb-3 text-sm font-medium text-gray-700">
              Awaiting dispatch ({pending.length})
            </h3>
            {pending.length === 0 ? (
              <p className="text-sm text-gray-500">No orders waiting for dispatch.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {pending.map((item) => (
                  <DispatchCard key={item.deliveryId} item={item} assignees={assignees} onRefresh={load} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-gray-700">
              Active deliveries ({active.length})
            </h3>
            {active.length === 0 ? (
              <p className="text-sm text-gray-500">No active dispatches.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {active.map((item) => (
                  <DispatchCard key={item.deliveryId} item={item} assignees={assignees} onRefresh={load} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
