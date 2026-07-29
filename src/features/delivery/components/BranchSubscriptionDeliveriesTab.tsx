"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { kitchenSubscriptionsApi } from "@/features/kitchen-subscriptions/services/kitchen-subscriptions.api";
import { deliveryBoysApi } from "@/features/delivery-boys/services/delivery-boys.api";
import {
  DISPATCH_STATUS_LABELS,
  PREP_STATUS_LABELS,
  type DriverDeliveryStop,
} from "@/features/delivery-boys/types/delivery-boys";
import {
  DISPATCH_STATUS_META,
  PREP_STATUS_META,
  type SubscriptionPrepRow,
} from "@/features/kitchen-subscriptions/types/kitchen-subscriptions";
import { cn } from "@/lib/utils";
import { DeliveryBranchFilter } from "./DeliveryBranchFilter";

function dispatchLabel(status: string): { label: string; className: string } {
  if (DISPATCH_STATUS_LABELS[status]) return DISPATCH_STATUS_LABELS[status];
  const kitchen = DISPATCH_STATUS_META[status as keyof typeof DISPATCH_STATUS_META];
  if (kitchen) return { label: kitchen.label, className: kitchen.className };
  return { label: status.replace(/_/g, " "), className: "bg-gray-100 text-gray-700" };
}

type SubscriptionTrackingRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  slotName: string;
  rotisLabel: string;
  totalQuantity: number;
  prepStatus: string;
  dispatchStatus: string;
  assigneeName: string | null;
};

function buildAssigneeMap(stops: DriverDeliveryStop[]) {
  const map = new Map<string, { assigneeName: string | null; dispatchStatus: string }>();
  for (const stop of stops) {
    map.set(stop.id, {
      assigneeName: stop.assigneeName ?? null,
      dispatchStatus: stop.dispatchStatus,
    });
  }
  return map;
}

function toTrackingRows(
  prepRows: SubscriptionPrepRow[],
  assigneeMap: Map<string, { assigneeName: string | null; dispatchStatus: string }>,
): SubscriptionTrackingRow[] {
  return prepRows.map((row) => {
    const assignment = assigneeMap.get(row.id);
    return {
      id: row.id,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      address: row.address,
      slotName: row.deliverySlotName ?? "—",
      rotisLabel: row.selectedRotis.map((item) => `${item.quantity}× ${item.name}`).join(", "),
      totalQuantity: row.totalQuantity,
      prepStatus: row.prepStatus,
      dispatchStatus: assignment?.dispatchStatus ?? row.dispatchStatus,
      assigneeName: assignment?.assigneeName ?? null,
    };
  });
}

export function BranchSubscriptionDeliveriesTab({
  branchId,
  onBranchChange,
  showBranchFilter = false,
}: {
  branchId?: string;
  onBranchChange?: (branchId: string | undefined) => void;
  showBranchFilter?: boolean;
} = {}) {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slotId, setSlotId] = useState("all");
  const [search, setSearch] = useState("");

  const resolvedSlotId = slotId === "all" ? undefined : slotId;

  const summaryQuery = useQuery({
    queryKey: ["subscription-deliveries", "summary", date, branchId],
    queryFn: () => kitchenSubscriptionsApi.getKitchenSummary({ date, branchId }),
  });

  const prepQuery = useQuery({
    queryKey: ["subscription-deliveries", "prep-list", date, resolvedSlotId, search, branchId],
    queryFn: () =>
      kitchenSubscriptionsApi.getPrepList({
        date,
        slotId: resolvedSlotId,
        search: search || undefined,
        branchId,
        includeCompleted: true,
      }),
  });

  const assignedQuery = useQuery({
    queryKey: ["subscription-deliveries", "assigned", date, resolvedSlotId, branchId],
    queryFn: () => deliveryBoysApi.listAssigned(date, resolvedSlotId, branchId),
  });

  const unassignedQuery = useQuery({
    queryKey: ["subscription-deliveries", "unassigned", date, resolvedSlotId, branchId],
    queryFn: () => deliveryBoysApi.listUnassigned(date, resolvedSlotId, branchId),
  });

  const dispatchBoardQuery = useQuery({
    queryKey: ["subscription-deliveries", "dispatch-board", date, resolvedSlotId, branchId],
    queryFn: () => deliveryBoysApi.listDispatchBoard(date, resolvedSlotId, branchId),
  });

  const slotOptions = useMemo(
    () => (summaryQuery.data?.bySlot ?? []).map((slot) => ({ id: slot.slotId, name: slot.slotName })),
    [summaryQuery.data],
  );

  const rows = useMemo(() => {
    const assigneeMap = buildAssigneeMap([
      ...(assignedQuery.data ?? []),
      ...(unassignedQuery.data ?? []),
      ...(dispatchBoardQuery.data ?? []),
    ]);
    return toTrackingRows(prepQuery.data ?? [], assigneeMap);
  }, [prepQuery.data, assignedQuery.data, unassignedQuery.data, dispatchBoardQuery.data]);

  const loading =
    prepQuery.isLoading ||
    assignedQuery.isLoading ||
    unassignedQuery.isLoading ||
    dispatchBoardQuery.isLoading;

  const hasError =
    prepQuery.isError ||
    assignedQuery.isError ||
    unassignedQuery.isError ||
    dispatchBoardQuery.isError;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[160px]"
            aria-label="Delivery date"
          />
          <Select value={slotId} onValueChange={setSlotId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Slots" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Slots</SelectItem>
              {slotOptions.map((slot) => (
                <SelectItem key={slot.id} value={slot.id}>
                  {slot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showBranchFilter && onBranchChange && (
            <DeliveryBranchFilter value={branchId} onChange={onBranchChange} />
          )}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search customer, phone, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading subscription deliveries…
          </div>
        ) : hasError ? (
          <div className="py-12 text-center text-sm text-red-600">
            Failed to load subscription deliveries
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50">
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-32">Slot</TableHead>
                <TableHead className="w-40">Rotis</TableHead>
                <TableHead className="w-32">Prep</TableHead>
                <TableHead className="w-32">Dispatch</TableHead>
                <TableHead className="w-36">Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No subscription deliveries for {format(new Date(`${date}T12:00:00`), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const prepMeta =
                    PREP_STATUS_META[row.prepStatus as keyof typeof PREP_STATUS_META] ??
                    PREP_STATUS_META.OTHER;
                  const dispatchMeta = dispatchLabel(row.dispatchStatus);

                  return (
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{row.customerName}</p>
                          <p className="text-sm text-gray-500">{row.customerPhone || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-sm text-gray-600" title={row.address}>
                        {row.address}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{row.slotName}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {row.totalQuantity}
                        {row.rotisLabel && (
                          <span className="block text-xs text-gray-400 truncate max-w-[160px]" title={row.rotisLabel}>
                            {row.rotisLabel}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", prepMeta.className)}>
                          {PREP_STATUS_LABELS[row.prepStatus] ?? prepMeta.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", dispatchMeta.className)}>
                          {dispatchMeta.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {row.assigneeName ?? <span className="text-gray-400">Unassigned</span>}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
