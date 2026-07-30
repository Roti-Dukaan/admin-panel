"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, UserCheck, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { AssigneeSelect } from "./AssigneeSelect";
import {
  useAssignableStaff,
  useSubscriptionAssignment,
} from "../hooks/useDeliveryBoys";
import {
  DISPATCH_STATUS_LABELS,
  PREP_STATUS_LABELS,
  type DriverDeliveryStop,
} from "../types/delivery-boys";

function extractError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

function DispatchRowActions({
  row,
  staff,
  onAssign,
  onAssignSelf,
  onUnassign,
  onReassign,
  busy,
}: {
  row: DriverDeliveryStop;
  staff: ReturnType<typeof useAssignableStaff>["data"];
  onAssign: (deliveryId: string, assigneeUserId: string) => void;
  onAssignSelf: (deliveryId: string) => void;
  onUnassign: (deliveryId: string) => void;
  onReassign: (deliveryId: string, assigneeUserId: string) => void;
  busy: boolean;
}) {
  const [rowAssignee, setRowAssignee] = React.useState("");

  if (row.canAssign) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <AssigneeSelect
          value={rowAssignee}
          onChange={setRowAssignee}
          staff={staff ?? []}
          className="h-8 w-40 text-xs"
          disabled={busy}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || !rowAssignee}
          onClick={() => onAssign(row.id, rowAssignee)}
        >
          Assign
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onAssignSelf(row.id)}
        >
          Self
        </Button>
      </div>
    );
  }

  if (row.canReassign) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {row.canUnassign && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onUnassign(row.id)}
          >
            <UserMinus className="mr-1 h-3.5 w-3.5" />
            Unassign
          </Button>
        )}
        <AssigneeSelect
          value={rowAssignee}
          onChange={setRowAssignee}
          staff={(staff ?? []).filter((s) => s.id !== row.assignedToUserId)}
          placeholder="Reassign to"
          className="h-8 w-40 text-xs"
          disabled={busy}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || !rowAssignee}
          onClick={() => onReassign(row.id, rowAssignee)}
        >
          Reassign
        </Button>
      </div>
    );
  }

  return <span className="text-xs text-gray-400">Locked</span>;
}

export function SubscriptionAssignmentPanel({ date, slotId }: { date: string; slotId?: string }) {
  const currentUserId = useAdminAuthStore((s) => s.user?.id);
  const {
    dispatchBoard,
    assign,
    bulkAssign,
    assignSelf,
    unassign,
    assignOne,
    assignOneSelf,
    unassignOne,
    reassign,
  } = useSubscriptionAssignment(date, slotId);
  const assignableQuery = useAssignableStaff(date, slotId);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkAssigneeId, setBulkAssigneeId] = React.useState("");

  const rows = dispatchBoard.data ?? [];
  const staff = assignableQuery.data ?? [];
  const busy =
    assign.isPending ||
    bulkAssign.isPending ||
    assignSelf.isPending ||
    unassign.isPending ||
    assignOne.isPending ||
    assignOneSelf.isPending ||
    unassignOne.isPending ||
    reassign.isPending;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    const selectable = rows.filter((r) => r.canAssign || r.canReassign).map((r) => r.id);
    setSelectedIds((prev) => (prev.length === selectable.length ? [] : selectable));
  };

  const handleBulkAssign = async () => {
    if (!bulkAssigneeId || selectedIds.length === 0) {
      toast.error("Select deliveries and an assignee");
      return;
    }
    try {
      const result = await bulkAssign.mutateAsync({
        deliveryIds: selectedIds,
        assigneeUserId: bulkAssigneeId,
        date,
        slotId,
        allowPartial: true,
      });
      const failed = (result as { failed?: Array<{ id: string; error: string }> }).failed ?? [];
      if (failed.length > 0) {
        toast.warning(`Assigned ${selectedIds.length - failed.length}; ${failed.length} failed`);
      } else {
        toast.success(`Assigned ${selectedIds.length} subscription deliveries`);
      }
      setSelectedIds([]);
    } catch (err: unknown) {
      toast.error(extractError(err, "Bulk assignment failed"));
    }
  };

  const handleBulkAssignSelf = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select deliveries first");
      return;
    }
    try {
      await assignSelf.mutateAsync({ deliveryIds: selectedIds, date, slotId });
      toast.success(`Assigned ${selectedIds.length} to yourself`);
      setSelectedIds([]);
    } catch (err: unknown) {
      toast.error(extractError(err, "Self assignment failed"));
    }
  };

  const handleBulkUnassign = async () => {
    const ids = selectedIds.filter((id) => rows.find((r) => r.id === id)?.canUnassign);
    if (ids.length === 0) {
      toast.error("No selected deliveries can be unassigned");
      return;
    }
    try {
      await unassign.mutateAsync({ deliveryIds: ids, date, slotId });
      toast.success(`Unassigned ${ids.length} deliveries`);
      setSelectedIds([]);
    } catch (err: unknown) {
      toast.error(extractError(err, "Unassign failed"));
    }
  };

  const handleAssign = async (deliveryId: string, assigneeUserId: string) => {
    try {
      await assignOne.mutateAsync({ deliveryId, assigneeUserId });
      toast.success("Assigned");
    } catch (err: unknown) {
      toast.error(extractError(err, "Assignment failed"));
    }
  };

  const handleAssignSelf = async (deliveryId: string) => {
    try {
      await assignOneSelf.mutateAsync(deliveryId);
      toast.success("Assigned to you");
    } catch (err: unknown) {
      toast.error(extractError(err, "Self assignment failed"));
    }
  };

  const handleUnassign = async (deliveryId: string) => {
    try {
      await unassignOne.mutateAsync(deliveryId);
      toast.success("Unassigned");
    } catch (err: unknown) {
      toast.error(extractError(err, "Unassign failed"));
    }
  };

  const handleReassign = async (deliveryId: string, assigneeUserId: string) => {
    try {
      await reassign.mutateAsync({ deliveryId, assigneeUserId });
      toast.success("Reassigned");
    } catch (err: unknown) {
      toast.error(extractError(err, "Reassign failed"));
    }
  };

  if (dispatchBoard.isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading dispatch board…
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-orange-100 bg-orange-50/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-orange-800">
          <UserCheck className="h-4 w-4" />
          Subscription dispatch & assignment ({rows.length})
        </h3>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-orange-200 bg-white p-3">
          <span className="text-sm font-medium text-gray-700">{selectedIds.length} selected</span>
          <AssigneeSelect
            value={bulkAssigneeId}
            onChange={setBulkAssigneeId}
            staff={staff}
            disabled={busy}
          />
          <Button
            type="button"
            size="sm"
            disabled={busy || !bulkAssigneeId}
            onClick={handleBulkAssign}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Bulk assign
          </Button>
          {currentUserId && (
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={handleBulkAssignSelf}>
              Assign to me
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={handleBulkUnassign}>
            Bulk unassign
          </Button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">No subscription deliveries waiting for dispatch</p>
          <p className="mt-2 text-sm text-gray-500">
            Packed deliveries appear here after you mark them ready in Subscription Prep. Use bulk assign or
            row actions to assign delivery boys or yourself.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === rows.filter((r) => r.canAssign || r.canReassign).length}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500"
                  />
                </th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Address</th>
                <th className="px-3 py-2">Slot</th>
                <th className="px-3 py-2">Rotis</th>
                <th className="px-3 py-2">Prep</th>
                <th className="px-3 py-2">Dispatch</th>
                <th className="px-3 py-2">Assigned to</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const dispatchMeta =
                  DISPATCH_STATUS_LABELS[row.dispatchStatus] ?? DISPATCH_STATUS_LABELS.UNASSIGNED;
                const selectable = row.canAssign || row.canReassign;
                return (
                  <tr key={row.id} className="border-b border-gray-100 align-top">
                    <td className="px-3 py-3">
                      {selectable && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="h-4 w-4 rounded border-gray-300 text-orange-500"
                        />
                      )}
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-900">
                      {row.customerName}
                      {row.routeSequence != null && (
                        <span className="ml-1 text-xs text-gray-400">#{row.routeSequence}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{row.customerPhone || "—"}</td>
                    <td className="max-w-[180px] truncate px-3 py-3 text-gray-600" title={row.address}>
                      {row.address}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{row.slot?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {row.totalQuantity}
                      <span className="block text-xs text-gray-400">
                        {row.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {PREP_STATUS_LABELS[row.prepStatus ?? row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", dispatchMeta.className)}>
                        {dispatchMeta.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {row.assigneeName ?? (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                      {row.assignedToRole === "BRANCH_MANAGER" && row.assigneeName && (
                        <span className="ml-1 text-xs text-indigo-500">(Manager)</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <DispatchRowActions
                        row={row}
                        staff={staff}
                        onAssign={handleAssign}
                        onAssignSelf={handleAssignSelf}
                        onUnassign={handleUnassign}
                        onReassign={handleReassign}
                        busy={busy}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
