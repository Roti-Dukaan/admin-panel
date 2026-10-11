"use client";

import { useState } from "react";
import { Bike, Loader2, User, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AssigneeSelect } from "@/features/delivery-boys/components/AssigneeSelect";
import type { AssignableStaff, DriverDeliveryStop } from "@/features/delivery-boys/types/delivery-boys";
import type { SubscriptionPrepRow } from "../types/kitchen-subscriptions";

function extractError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

export function SubscriptionPrepDispatchActions({
  row,
  dispatchInfo,
  staff,
  busy,
  onAssign,
  onAssignSelf,
  onUnassign,
  onReassign,
}: {
  row: SubscriptionPrepRow;
  dispatchInfo?: DriverDeliveryStop;
  staff: AssignableStaff[];
  busy: boolean;
  onAssign: (deliveryId: string, assigneeUserId: string) => Promise<void>;
  onAssignSelf: (deliveryId: string) => Promise<void>;
  onUnassign: (deliveryId: string) => Promise<void>;
  onReassign: (deliveryId: string, assigneeUserId: string) => Promise<void>;
}) {
  const [selectedBoy, setSelectedBoy] = useState("");

  const canAssign =
    dispatchInfo?.canAssign ??
    (row.packingStatus === "PACKED" &&
      row.dispatchStatus !== "DELIVERED" &&
      !dispatchInfo?.assignedToUserId);

  const canReassign = dispatchInfo?.canReassign && !!dispatchInfo?.assignedToUserId;
  const assigneeName = dispatchInfo?.assigneeName;

  const run = async (fn: () => Promise<void>, successMessage: string) => {
    try {
      await fn();
      toast.success(successMessage);
    } catch (err: unknown) {
      toast.error(extractError(err, "Could not update driver assignment"));
    }
  };

  if (canAssign) {
    return (
      <div className="flex min-w-[280px] flex-col items-end gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          Assign driver
        </p>
        <div className="flex flex-wrap justify-end gap-1.5">
          <AssigneeSelect
            value={selectedBoy}
            onChange={setSelectedBoy}
            staff={staff}
            placeholder="Boy"
            className="h-8 w-[7.5rem] text-xs"
            disabled={busy}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 gap-1 px-2 text-xs"
            disabled={busy || !selectedBoy}
            onClick={() =>
              run(
                () => onAssign(row.id, selectedBoy),
                "Assigned to delivery partner",
              )
            }
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bike className="h-3.5 w-3.5" />}
            Assign
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1 px-2 text-xs"
            disabled={busy}
            onClick={() => run(() => onAssignSelf(row.id), "Assigned to you")}
          >
            <User className="h-3.5 w-3.5" />
            Self
          </Button>
        </div>
      </div>
    );
  }

  if (canReassign) {
    return (
      <div className="flex min-w-[280px] flex-col items-end gap-1.5">
        <p className="text-xs font-medium text-indigo-700">
          Driver: {assigneeName ?? "Assigned"}
        </p>
        <div className="flex flex-wrap justify-end gap-1.5">
          {dispatchInfo?.canUnassign ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2 text-xs"
              disabled={busy}
              onClick={() => run(() => onUnassign(row.id), "Driver unassigned")}
            >
              <UserMinus className="h-3.5 w-3.5" />
              Unassign
            </Button>
          ) : null}
          <AssigneeSelect
            value={selectedBoy}
            onChange={setSelectedBoy}
            staff={staff.filter((s) => s.id !== dispatchInfo?.assignedToUserId)}
            placeholder="Reassign"
            className="h-8 w-[7.5rem] text-xs"
            disabled={busy}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            disabled={busy || !selectedBoy}
            onClick={() =>
              run(
                () => onReassign(row.id, selectedBoy),
                "Driver reassigned",
              )
            }
          >
            Reassign
          </Button>
        </div>
      </div>
    );
  }

  if (assigneeName) {
    return (
      <p className="text-xs font-medium text-indigo-700">
        Driver: {assigneeName}
      </p>
    );
  }

  if (row.packingStatus === "PACKED" && row.dispatchStatus === "READY") {
    return (
      <p className="text-xs text-gray-500">Ready for driver assignment</p>
    );
  }

  return null;
}
