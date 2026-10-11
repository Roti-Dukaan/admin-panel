"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bike, Loader2, Tag, Truck, User } from "lucide-react";
import { DocumentQuickAction } from "@/features/documents";
import { Button } from "@/components/ui/button";
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
} from "@/features/realtime-dispatch/services/realtime-dispatch.api";
import { KITCHEN_DETAIL_QUERY_KEY } from "../utils/kitchen-realtime-sync";

const DISPATCHABLE_DELIVERY_STATUSES = new Set([
  "WAITING_FOR_PROVIDER",
  "PROVIDER_ASSIGNMENT_FAILED",
]);

function useDispatchAssignees() {
  return useQuery({
    queryKey: ["realtime-dispatch", "assignees"],
    queryFn: () => realtimeDispatchApi.getAssignees(),
    staleTime: 30_000,
  });
}

export function KitchenDispatchActions({
  deliveryId,
  deliveryStatus,
  orderId,
}: {
  deliveryId: string;
  deliveryStatus: string;
  orderId: string;
}) {
  const queryClient = useQueryClient();
  const { data: assignees = [], isLoading: loadingAssignees } = useDispatchAssignees();
  const [busy, setBusy] = useState(false);
  const [selectedBoy, setSelectedBoy] = useState("");

  if (!DISPATCHABLE_DELIVERY_STATUSES.has(deliveryStatus)) {
    return null;
  }

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: KITCHEN_DETAIL_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ["kitchen", "detail", orderId] }),
      queryClient.invalidateQueries({ queryKey: ["realtime-dispatch"] }),
    ]);
  };

  const run = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(msg);
      await refresh();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Could not assign driver");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Assign delivery
        </p>
        <DocumentQuickAction
          orderId={orderId}
          documentType="DELIVERY_LABEL"
          label="Label"
          icon={Tag}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          className="h-8 flex-1 min-w-[5.5rem] bg-orange-500 px-2 text-xs text-white hover:bg-orange-600"
          disabled={busy}
          onClick={() =>
            run(() => realtimeDispatchApi.dispatchBorzo(deliveryId), "Sent to Borzo")
          }
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Truck className="mr-1 h-3.5 w-3.5" />
          )}
          Borzo
        </Button>

        <Select value={selectedBoy} onValueChange={setSelectedBoy} disabled={busy || loadingAssignees}>
          <SelectTrigger className="h-8 w-[6.5rem] flex-1 min-w-[6.5rem] text-[11px]">
            <SelectValue placeholder={loadingAssignees ? "Loading…" : "Boy"} />
          </SelectTrigger>
          <SelectContent>
            {assignees.map((staff: AssignableStaff) => (
              <SelectItem key={staff.id} value={staff.id} className="text-xs">
                {staff.name ?? staff.email} ({staff.activeLoad})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 flex-1 min-w-[5.5rem] px-2 text-xs"
          disabled={busy || !selectedBoy}
          onClick={() =>
            run(
              () =>
                realtimeDispatchApi.dispatchInHouse(deliveryId, {
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
          type="button"
          size="sm"
          variant="outline"
          className="h-8 flex-1 min-w-[4.5rem] px-2 text-xs"
          disabled={busy}
          onClick={() =>
            run(() => realtimeDispatchApi.assignSelf(deliveryId), "Assigned to you")
          }
        >
          <User className="mr-1 h-3.5 w-3.5" />
          Self
        </Button>
      </div>
    </div>
  );
}
