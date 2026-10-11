"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, UserCheck, UserPlus, UserMinus, Route, Navigation } from "lucide-react";
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
import { RoutePreviewModal } from "@/features/dispatch-routes/components/RoutePreviewModal";
import { RouteSheetPrint } from "@/features/dispatch-routes/components/RouteSheetPrint";
import {
  dispatchRoutesApi,
  type RouteOptimizationResult,
} from "@/features/dispatch-routes/services/dispatch-routes.api";
import { RouteBatchPanel } from "@/features/subscription-dispatch/components/RouteBatchPanel";
import {
  useRouteBatches,
  useSubscriptionDispatchMutations,
} from "@/features/subscription-dispatch/hooks/useSubscriptionDispatch";
import type { SubscriptionRouteBatch } from "@/features/subscription-dispatch/services/subscription-dispatch.api";

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

export function SubscriptionAssignmentPanel({
  date,
  slotId,
  areaFilter,
}: {
  date: string;
  slotId?: string;
  areaFilter?: string;
}) {
  const currentUserId = useAdminAuthStore((s) => s.user?.id);
  const {
    dispatchBoard,
    assign,
    unassign,
    assignOne,
    assignOneSelf,
    unassignOne,
    reassign,
  } = useSubscriptionAssignment(date, slotId);
  const { bulkAssign, assignSelf: bulkAssignSelf } = useSubscriptionDispatchMutations();
  const routeBatchesQuery = useRouteBatches(date, slotId);
  const assignableQuery = useAssignableStaff(date, slotId);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkAssigneeId, setBulkAssigneeId] = React.useState("");
  const [routeBusy, setRouteBusy] = React.useState(false);
  const [optimization, setOptimization] = React.useState<RouteOptimizationResult | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [createdRouteId, setCreatedRouteId] = React.useState<string | null>(null);
  const [routeDriverId, setRouteDriverId] = React.useState("");
  const [lastCreatedBatch, setLastCreatedBatch] = React.useState<SubscriptionRouteBatch | null>(null);
  const [activeBatchId, setActiveBatchId] = React.useState<string | null>(null);

  const allRows = dispatchBoard.data ?? [];
  const rows = React.useMemo(() => {
    if (!areaFilter?.trim()) return allRows;
    const q = areaFilter.trim().toLowerCase();
    return allRows.filter((r) => r.address.toLowerCase().includes(q));
  }, [allRows, areaFilter]);
  const routeBatches = routeBatchesQuery.data ?? [];
  const activeBatch =
    routeBatches.find((b) => b.id === activeBatchId) ??
    lastCreatedBatch ??
    routeBatches[0] ??
    null;
  const staff = assignableQuery.data ?? [];
  const busy =
    assign.isPending ||
    bulkAssign.isPending ||
    bulkAssignSelf.isPending ||
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
        optimize: true,
      });
      const failed = result.assignment.failed ?? [];
      if (failed.length > 0) {
        toast.warning(`Assigned ${result.assignment.assignedCount}; ${failed.length} failed`);
      } else {
        toast.success(`Assigned ${result.assignment.assignedCount} deliveries with route batch`);
      }
      if (result.routeBatch) {
        setLastCreatedBatch(result.routeBatch);
        setActiveBatchId(result.routeBatch.id);
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
      const result = await bulkAssignSelf.mutateAsync({
        deliveryIds: selectedIds,
        date,
        slotId,
        optimize: true,
      });
      if (result.routeBatch) {
        setLastCreatedBatch(result.routeBatch);
        setActiveBatchId(result.routeBatch.id);
      }
      toast.success(`Assigned ${selectedIds.length} to yourself with route batch`);
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
      const result = await bulkAssignSelf.mutateAsync({
        deliveryIds: [deliveryId],
        date,
        slotId,
      });
      if (result.routeBatch) {
        setLastCreatedBatch(result.routeBatch);
        setActiveBatchId(result.routeBatch.id);
      }
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

  const selectedStopRefs = selectedIds.map((id) => ({ type: "SUBSCRIPTION" as const, id }));

  const handleOptimizeRoute = async () => {
    if (selectedStopRefs.length < 2) {
      toast.error("Select at least 2 deliveries to optimize");
      return;
    }
    setRouteBusy(true);
    try {
      const result = await dispatchRoutesApi.optimize({
        stopIds: selectedStopRefs,
        date,
        deliverySlotId: slotId,
      });
      setOptimization(result);
      setPreviewOpen(true);
    } catch (err: unknown) {
      toast.error(extractError(err, "Route optimization failed"));
    } finally {
      setRouteBusy(false);
    }
  };

  const createRouteFromOptimization = async (routeType: "SELF" | "BORZO") => {
    if (!optimization) return null;
    const route = await dispatchRoutesApi.createRoute({
      date,
      deliverySlotId: slotId,
      routeType,
      stops: optimization.stops.map((s) => ({
        type: s.type,
        id: s.id,
        sequence: s.sequence,
        latitude: s.latitude,
        longitude: s.longitude,
        distanceFromPreviousMeters: s.distanceFromPreviousMeters ?? undefined,
        durationFromPreviousSeconds: s.durationFromPreviousSeconds ?? undefined,
      })),
      distanceMeters: optimization.totalDistanceMeters,
      durationSeconds: optimization.totalDurationSeconds,
    });
    setCreatedRouteId(route.id);
    return route;
  };

  const handleAssignDriverFromPreview = async (driverId: string) => {
    if (!optimization) return;
    setRouteBusy(true);
    try {
      const route = await createRouteFromOptimization("SELF");
      if (!route) return;
      const result = await dispatchRoutesApi.assignRoute(route.id, {
        routeType: "SELF",
        driverId,
      });
      if (result.failures?.length) {
        toast.warning(`Route created with ${result.failures.length} assignment warning(s)`);
      } else {
        toast.success(`Route ${route.routeNumber} assigned to driver`);
      }
      setPreviewOpen(false);
      setSelectedIds([]);
      setOptimization(null);
    } catch (err: unknown) {
      toast.error(extractError(err, "Driver assignment failed"));
    } finally {
      setRouteBusy(false);
    }
  };

  const handleAssignBorzoFromPreview = async () => {
    if (!optimization) return;
    setRouteBusy(true);
    try {
      const route = await createRouteFromOptimization("BORZO");
      if (!route) return;
      const result = await dispatchRoutesApi.assignRoute(route.id, { routeType: "BORZO" });
      if (result.failures?.length) {
        toast.warning(`Borzo dispatch: ${result.failures.length} stop(s) failed`);
      } else {
        toast.success(`Route ${route.routeNumber} sent to Borzo`);
      }
      setPreviewOpen(false);
      setSelectedIds([]);
      setOptimization(null);
    } catch (err: unknown) {
      toast.error(extractError(err, "Borzo assignment failed"));
    } finally {
      setRouteBusy(false);
    }
  };

  const handleToolbarAssignDriver = async () => {
    if (!routeDriverId || selectedStopRefs.length < 2) {
      toast.error("Select driver and at least 2 deliveries");
      return;
    }
    setRouteBusy(true);
    try {
      const result = await dispatchRoutesApi.optimize({
        stopIds: selectedStopRefs,
        date,
        deliverySlotId: slotId,
      });
      const route = await dispatchRoutesApi.createRoute({
        date,
        deliverySlotId: slotId,
        routeType: "SELF",
        stops: result.stops.map((s) => ({
          type: s.type,
          id: s.id,
          sequence: s.sequence,
          latitude: s.latitude,
          longitude: s.longitude,
          distanceFromPreviousMeters: s.distanceFromPreviousMeters ?? undefined,
          durationFromPreviousSeconds: s.durationFromPreviousSeconds ?? undefined,
        })),
        distanceMeters: result.totalDistanceMeters,
        durationSeconds: result.totalDurationSeconds,
      });
      const assignResult = await dispatchRoutesApi.assignRoute(route.id, {
        routeType: "SELF",
        driverId: routeDriverId,
      });
      setCreatedRouteId(route.id);
      if (assignResult.failures?.length) {
        toast.warning(`Route ${route.routeNumber} created with warnings`);
      } else {
        toast.success(`Route ${route.routeNumber} assigned`);
      }
      setSelectedIds([]);
    } catch (err: unknown) {
      toast.error(extractError(err, "Assign driver failed"));
    } finally {
      setRouteBusy(false);
    }
  };

  const handleToolbarAssignBorzo = async () => {
    if (selectedStopRefs.length < 2) {
      toast.error("Select at least 2 deliveries");
      return;
    }
    setRouteBusy(true);
    try {
      const result = await dispatchRoutesApi.optimize({
        stopIds: selectedStopRefs,
        date,
        deliverySlotId: slotId,
      });
      const route = await dispatchRoutesApi.createRoute({
        date,
        deliverySlotId: slotId,
        routeType: "BORZO",
        stops: result.stops.map((s) => ({
          type: s.type,
          id: s.id,
          sequence: s.sequence,
          latitude: s.latitude,
          longitude: s.longitude,
          distanceFromPreviousMeters: s.distanceFromPreviousMeters ?? undefined,
          durationFromPreviousSeconds: s.durationFromPreviousSeconds ?? undefined,
        })),
        distanceMeters: result.totalDistanceMeters,
        durationSeconds: result.totalDurationSeconds,
      });
      await dispatchRoutesApi.assignRoute(route.id, { routeType: "BORZO" });
      setCreatedRouteId(route.id);
      toast.success(`Route ${route.routeNumber} sent to Borzo`);
      setSelectedIds([]);
    } catch (err: unknown) {
      toast.error(extractError(err, "Borzo dispatch failed"));
    } finally {
      setRouteBusy(false);
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={routeBusy || selectedIds.length < 2}
            onClick={handleOptimizeRoute}
          >
            <Route className="mr-1 h-4 w-4" />
            Optimize Route
          </Button>
          <AssigneeSelect
            value={routeDriverId}
            onChange={setRouteDriverId}
            staff={staff}
            disabled={routeBusy}
            placeholder="Driver for route"
            className="h-8 w-40 text-xs"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={routeBusy || selectedIds.length < 2 || !routeDriverId}
            onClick={handleToolbarAssignDriver}
          >
            <Navigation className="mr-1 h-4 w-4" />
            Assign Driver
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={routeBusy || selectedIds.length < 2}
            onClick={handleToolbarAssignBorzo}
          >
            Assign Borzo
          </Button>
          {createdRouteId && <RouteSheetPrint routeId={createdRouteId} />}
        </div>
      </div>

      <RoutePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        optimization={optimization}
        staff={staff}
        busy={routeBusy}
        onAssignDriver={handleAssignDriverFromPreview}
        onAssignBorzo={handleAssignBorzoFromPreview}
        onCancel={() => {
          setPreviewOpen(false);
          setOptimization(null);
        }}
      />

      {routeBatches.length > 0 && (
        <div className="space-y-2">
          {routeBatches.length > 1 && (
            <select
              className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
              value={activeBatch?.id ?? ""}
              onChange={(e) => setActiveBatchId(e.target.value)}
            >
              {routeBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.driverName ?? "Driver"} · {b.deliverySlotName ?? "Slot"} · {b.totalStops} stops ·{" "}
                  {b.optimizationStatus}
                </option>
              ))}
            </select>
          )}
          {activeBatch && (
            <RouteBatchPanel batch={activeBatch} onUpdated={() => routeBatchesQuery.refetch()} />
          )}
        </div>
      )}

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
                <th className="px-3 py-2">Items</th>
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
                    <td className="max-w-[220px] px-3 py-3 text-gray-600">
                      {row.items.length === 0 ? (
                        <span className="text-gray-400">No items</span>
                      ) : (
                        <div className="space-y-0.5">
                          {row.items.map((item, index) => (
                            <p key={`${row.id}-${index}`} className="text-xs leading-snug text-gray-700">
                              <span className="font-semibold text-gray-900">{item.quantity}×</span>{" "}
                              {item.name}
                            </p>
                          ))}
                        </div>
                      )}
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
