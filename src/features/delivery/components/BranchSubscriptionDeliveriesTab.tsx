"use client";

import { useMemo, useState } from "react";
import { formatIstDate, todayDateKey } from "@/lib/date";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CopyTextButton } from "@/components/shared/CopyTextButton";
import { compactTableCellClass, compactTableHeadClass } from "@/components/shared/compact-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { kitchenSubscriptionsApi, type SubscriptionKitchenApiScope } from "@/features/kitchen-subscriptions/services/kitchen-subscriptions.api";
import { deliveryBoysApi, type SubscriptionDeliveryApiScope } from "@/features/delivery-boys/services/delivery-boys.api";
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
import { SubscriptionDeliveryStats } from "./SubscriptionDeliveryStats";

function dispatchLabel(status: string): { label: string; className: string } {
  if (DISPATCH_STATUS_LABELS[status]) return DISPATCH_STATUS_LABELS[status];
  const kitchen = DISPATCH_STATUS_META[status as keyof typeof DISPATCH_STATUS_META];
  if (kitchen) return { label: kitchen.label, className: kitchen.className };
  return { label: status.replace(/_/g, " "), className: "bg-gray-100 text-gray-700" };
}

type SubscriptionTrackingRow = {
  id: string;
  deliveryNumber: string | null;
  subscriptionId: string;
  subscriptionNumber: string | null;
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
      deliveryNumber: row.deliveryNumber ?? null,
      subscriptionId: row.subscriptionId,
      subscriptionNumber: row.subscriptionNumber ?? null,
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
  apiMode = "branch",
  branchId,
  onBranchChange,
  showBranchFilter = false,
}: {
  apiMode?: SubscriptionKitchenApiScope;
  branchId?: string;
  onBranchChange?: (branchId: string | undefined) => void;
  showBranchFilter?: boolean;
} = {}) {
  const deliveryScope: SubscriptionDeliveryApiScope = apiMode;
  const [date, setDate] = useState(() => todayDateKey());
  const [slotId, setSlotId] = useState("all");
  const [search, setSearch] = useState("");

  const resolvedSlotId = slotId === "all" ? undefined : slotId;

  const summaryQuery = useQuery({
    queryKey: ["subscription-deliveries", "summary", apiMode, date, branchId],
    queryFn: () => kitchenSubscriptionsApi.getKitchenSummary({ date, branchId }, apiMode),
  });

  const prepQuery = useQuery({
    queryKey: ["subscription-deliveries", "prep-list", apiMode, date, resolvedSlotId, search, branchId],
    queryFn: () =>
      kitchenSubscriptionsApi.getPrepList(
        {
          date,
          slotId: resolvedSlotId,
          search: search || undefined,
          branchId,
          includeCompleted: true,
        },
        apiMode,
      ),
  });

  const assignedQuery = useQuery({
    queryKey: ["subscription-deliveries", "assigned", apiMode, date, resolvedSlotId, branchId],
    queryFn: () => deliveryBoysApi.listAssigned(date, resolvedSlotId, branchId, deliveryScope),
  });

  const unassignedQuery = useQuery({
    queryKey: ["subscription-deliveries", "unassigned", apiMode, date, resolvedSlotId, branchId],
    queryFn: () => deliveryBoysApi.listUnassigned(date, resolvedSlotId, branchId, deliveryScope),
  });

  const dispatchBoardQuery = useQuery({
    queryKey: ["subscription-deliveries", "dispatch-board", apiMode, date, resolvedSlotId, branchId],
    queryFn: () => deliveryBoysApi.listDispatchBoard(date, resolvedSlotId, branchId, deliveryScope),
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

  const loading = prepQuery.isLoading || summaryQuery.isLoading;

  const hasError = prepQuery.isError || summaryQuery.isError;

  return (
    <div className="space-y-4">
      <SubscriptionDeliveryStats
        apiMode={apiMode}
        date={date}
        branchId={branchId}
        slotId={resolvedSlotId}
        search={search}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-[140px] text-sm"
            aria-label="Delivery date"
          />
          <Select value={slotId} onValueChange={setSlotId}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="Slot" />
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
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search customer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading subscription deliveries…
          </div>
        ) : hasError ? (
          <div className="py-10 text-center text-sm text-red-600">
            Failed to load subscription deliveries
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                <TableHead className={cn(compactTableHeadClass, "w-[9rem]")}>Delivery ID</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-[9rem]")}>Subscription</TableHead>
                <TableHead className={compactTableHeadClass}>Customer</TableHead>
                <TableHead className={compactTableHeadClass}>Address</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-20")}>Slot</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-24")}>Rotis</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-24")}>Prep</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-24")}>Dispatch</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-24")}>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-gray-500">
                    No subscription deliveries for {formatIstDate(date)}
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
                      <TableCell className={compactTableCellClass}>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="truncate font-mono text-sm text-gray-900"
                            title={row.deliveryNumber ?? row.id}
                          >
                            {row.deliveryNumber ?? "—"}
                          </span>
                          {row.deliveryNumber ? (
                            <CopyTextButton
                              text={row.deliveryNumber}
                              label="Delivery ID copied!"
                              title="Copy delivery ID"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className={compactTableCellClass}>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="truncate font-mono text-sm text-gray-900"
                            title={row.subscriptionNumber ?? row.subscriptionId}
                          >
                            {row.subscriptionNumber ?? "—"}
                          </span>
                          {row.subscriptionNumber ? (
                            <CopyTextButton
                              text={row.subscriptionNumber}
                              label="Subscription ID copied!"
                              title="Copy subscription ID"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className={cn(compactTableCellClass, "max-w-[140px]")}>
                        <p className="truncate text-gray-900">
                          <span className="font-medium">{row.customerName}</span>
                          {row.customerPhone && (
                            <>
                              <span className="text-gray-400"> · </span>
                              <span className="text-gray-500">{row.customerPhone}</span>
                            </>
                          )}
                        </p>
                      </TableCell>
                      <TableCell
                        className={cn(compactTableCellClass, "max-w-[160px] truncate text-gray-600")}
                        title={row.address}
                      >
                        {row.address}
                      </TableCell>
                      <TableCell className={cn(compactTableCellClass, "text-gray-600")}>
                        {row.slotName}
                      </TableCell>
                      <TableCell className={cn(compactTableCellClass, "text-gray-600")}>
                        <span className="font-medium">{row.totalQuantity}</span>
                        {row.rotisLabel && (
                          <span className="ml-1 truncate text-gray-400" title={row.rotisLabel}>
                            ({row.rotisLabel})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={compactTableCellClass}>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", prepMeta.className)}>
                          {PREP_STATUS_LABELS[row.prepStatus] ?? prepMeta.label}
                        </span>
                      </TableCell>
                      <TableCell className={compactTableCellClass}>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", dispatchMeta.className)}>
                          {dispatchMeta.label}
                        </span>
                      </TableCell>
                      <TableCell className={cn(compactTableCellClass, "truncate text-gray-600")}>
                        {row.assigneeName ?? <span className="text-gray-400">—</span>}
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
