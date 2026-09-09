"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { FNS_DATE_TIME, FNS_TIME } from "@/lib/date";
import type { Delivery, DeliveryFilters, DeliveryStatus, DeliveryProvider } from "@/features/delivery/types/delivery";
import { DeliveryStatusBadge, DeliveryProviderBadge, DeliveryTypeBadge } from "./DeliveryStatusBadge";
import { DeliveryDetailModal } from "./DeliveryDetailModal";
import { deliveryApi } from "../services/delivery.api";
import { branchDeliveryApi } from "../services/branch-delivery.api";
import { useDeliveriesRealtime } from "../hooks/useDeliveriesRealtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CopyTextButton } from "@/components/shared/CopyTextButton";
import { compactTableCellClass, compactTableHeadClass } from "@/components/shared/compact-table";
import { toast } from "sonner";
import { DeliveryStats } from "./DeliveryStats";
import { DeliveryBranchFilter } from "./DeliveryBranchFilter";
import { formatDeliverySlotLabel } from "@/lib/delivery-slot-display";
import { cn } from "@/lib/utils";

function customerName(delivery: Delivery): string {
  return delivery.order?.customer?.fullName ?? delivery.order?.customer?.name ?? "—";
}

function customerPhone(delivery: Delivery): string {
  return delivery.order?.customer?.phone ?? "—";
}

function orderNumber(delivery: Delivery): string {
  return delivery.order?.orderNumber ?? delivery.orderId;
}

function getDeliveryProgressTime(delivery: Delivery): string | null {
  if (delivery.actualDeliveryAt) {
    return `✓ ${format(new Date(delivery.actualDeliveryAt), FNS_DATE_TIME)}`;
  }
  if (delivery.estimatedDeliveryAt) {
    return `ETA ${format(new Date(delivery.estimatedDeliveryAt), FNS_TIME)}`;
  }
  if (delivery.estimatedPickupAt) {
    return `Pickup ${format(new Date(delivery.estimatedPickupAt), FNS_TIME)}`;
  }
  return null;
}

function formatScheduledSlot(delivery: Delivery): string | null {
  const slot = delivery.order?.deliverySlot;
  if (!slot) return null;
  const window = formatDeliverySlotLabel(slot.startTime, slot.endTime);
  return slot.name ? `${slot.name} (${window})` : window;
}

function DeliveryTimeCell({ delivery }: { delivery: Delivery }) {
  const isScheduled = delivery.deliveryType === "SCHEDULED" || !!delivery.order?.deliverySlot;
  const scheduledLabel = isScheduled ? formatScheduledSlot(delivery) : null;
  const progressTime = getDeliveryProgressTime(delivery);

  if (!scheduledLabel && !progressTime) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="space-y-0.5">
      {scheduledLabel && (
        <p className="text-xs font-medium text-sky-700">{scheduledLabel}</p>
      )}
      {progressTime && <p className="text-xs text-gray-600">{progressTime}</p>}
    </div>
  );
}

const compactInputClass = "h-9 text-sm";
const compactSelectClass = "h-9 text-sm";

export function DeliveryListPage({
  apiMode = "admin",
  branchId: controlledBranchId,
  onBranchChange,
  showBranchFilter = false,
}: {
  apiMode?: "admin" | "branch";
  branchId?: string;
  onBranchChange?: (branchId: string | undefined) => void;
  showBranchFilter?: boolean;
}) {
  const api = apiMode === "branch" ? branchDeliveryApi : deliveryApi;
  const readOnly = apiMode === "branch";
  const [internalBranchId, setInternalBranchId] = useState<string | undefined>();
  const branchId = controlledBranchId ?? internalBranchId;
  const handleBranchChange = onBranchChange ?? setInternalBranchId;
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<DeliveryFilters>({
    status: "all",
    provider: "all",
    search: "",
    page: 1,
    limit: 10,
    branchId,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setFilters((prev) => (prev.branchId === branchId ? prev : { ...prev, branchId, page: 1 }));
  }, [branchId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list(filters);
      setDeliveries(data.items);
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });

      const params = new URLSearchParams(window.location.search);
      const deepLinkId = params.get("deliveryId");
      const deepLinkSearch = params.get("search");
      if (deepLinkSearch && filters.search !== deepLinkSearch) {
        setFilters((prev) => ({ ...prev, search: deepLinkSearch }));
        return;
      }
      if (deepLinkId) {
        const match = data.items.find((d) => d.id === deepLinkId);
        if (match) {
          setSelectedDelivery(match);
          setShowModal(true);
        } else {
          const detail = await api.getById(deepLinkId);
          setSelectedDelivery(detail);
          setShowModal(true);
        }
      }
    } catch (error) {
      toast.error("Failed to load deliveries");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useDeliveriesRealtime(fetchData);

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  const handleStatusUpdate = async (status: string, remarks?: string) => {
    if (!selectedDelivery) return;
    setUpdatingId(selectedDelivery.id);
    try {
      await deliveryApi.updateStatus(selectedDelivery.id, status as DeliveryStatus, remarks);
      toast.success(`Delivery status updated to ${status.replace("_", " ")}`);
      fetchData();
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!selectedDelivery) return;
    setUpdatingId(selectedDelivery.id);
    try {
      await deliveryApi.cancel(selectedDelivery.id, reason);
      toast.success("Delivery cancelled");
      fetchData();
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to cancel delivery");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRetryDelivery = async () => {
    if (!selectedDelivery) return;
    setUpdatingId(selectedDelivery.id);
    try {
      const updated = await deliveryApi.retry(selectedDelivery.id);
      setSelectedDelivery(updated);
      toast.success("Provider assignment retried");
      fetchData();
    } catch (error) {
      toast.error("Failed to retry assignment");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefreshDelivery = async () => {
    if (!selectedDelivery) return;
    setUpdatingId(selectedDelivery.id);
    try {
      const updated = await deliveryApi.refresh(selectedDelivery.id);
      setSelectedDelivery(updated);
      toast.success("Status refreshed");
      fetchData();
    } catch (error) {
      toast.error("Failed to refresh status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof DeliveryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getStatusFromRow = (row: Delivery) => row.status as DeliveryStatus;
  const getProviderFromRow = (row: Delivery) => row.provider as DeliveryProvider;

  return (
    <div className="space-y-4">
        <DeliveryStats apiMode={apiMode} branchId={branchId} />

        <div className="rounded-lg border border-gray-200 bg-white p-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search order #, customer..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(compactInputClass, "pl-9")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {showBranchFilter && (
                <DeliveryBranchFilter
                  value={branchId}
                  onChange={handleBranchChange}
                />
              )}
              <Select value={filters.status || "all"} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className={cn(compactSelectClass, "w-[130px]")}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="WAITING_FOR_KITCHEN">Waiting for Kitchen</SelectItem>
                  <SelectItem value="WAITING_FOR_PROVIDER">Waiting for Provider</SelectItem>
                  <SelectItem value="PROVIDER_ASSIGNMENT_FAILED">Assignment Failed</SelectItem>
                  <SelectItem value="PROVIDER_ASSIGNED">Provider Assigned</SelectItem>
                  <SelectItem value="RIDER_ARRIVING">Rider Arriving</SelectItem>
                  <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                  <SelectItem value="NEAR_CUSTOMER">Near Customer</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.provider || "all"} onValueChange={(v) => handleFilterChange("provider", v)}>
                <SelectTrigger className={cn(compactSelectClass, "w-[120px]")}>
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="SHADOWFAX">Shadowfax</SelectItem>
                  <SelectItem value="SELF_DELIVERY">Self Delivery</SelectItem>
                  <SelectItem value="SHIPROCKET">Shiprocket</SelectItem>
                  <SelectItem value="PORTER">Porter</SelectItem>
                  <SelectItem value="BORZO">Borzo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.deliveryType || "all"} onValueChange={(v) => handleFilterChange("deliveryType", v)}>
                <SelectTrigger className={cn(compactSelectClass, "w-[110px]")}>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="QUICK">Quick</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className={cn(compactInputClass, "w-[130px]")}
                aria-label="Date from"
              />
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className={cn(compactInputClass, "w-[130px]")}
                aria-label="Date to"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                <TableHead className={cn(compactTableHeadClass, "w-[11rem]")}>Order #</TableHead>
                <TableHead className={compactTableHeadClass}>Customer</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-28")}>Provider</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-36")}>Status</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-36")}>Time</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-24")}>Rider</TableHead>
                <TableHead className={cn(compactTableHeadClass, "w-14 text-right")} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className={compactTableCellClass}><div className="h-4 w-20 rounded bg-gray-200" /></TableCell>
                    <TableCell className={compactTableCellClass}><div className="h-4 w-28 rounded bg-gray-200" /></TableCell>
                    <TableCell className={compactTableCellClass}><div className="h-4 w-16 rounded bg-gray-200" /></TableCell>
                    <TableCell className={compactTableCellClass}><div className="h-4 w-20 rounded bg-gray-200" /></TableCell>
                    <TableCell className={compactTableCellClass}><div className="h-4 w-16 rounded bg-gray-200" /></TableCell>
                    <TableCell className={compactTableCellClass}><div className="h-4 w-14 rounded bg-gray-200" /></TableCell>
                    <TableCell className={compactTableCellClass}><div className="h-4 w-8 rounded bg-gray-200" /></TableCell>
                  </TableRow>
                ))
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">
                    No deliveries found
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => {
                  const orderNo = orderNumber(delivery);
                  return (
                  <TableRow key={delivery.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(delivery)}>
                    <TableCell className={compactTableCellClass}>
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-mono text-sm font-medium text-gray-900" title={orderNo}>
                          {orderNo}
                        </span>
                        <CopyTextButton text={orderNo} label="Order ID copied!" title="Copy order ID" />
                      </div>
                    </TableCell>
                    <TableCell className={cn(compactTableCellClass, "max-w-[180px]")}>
                      <p className="truncate text-gray-900">
                        <span className="font-medium">{customerName(delivery)}</span>
                        <span className="text-gray-400"> · </span>
                        <span className="text-gray-500">{customerPhone(delivery)}</span>
                      </p>
                    </TableCell>
                    <TableCell className={compactTableCellClass}>
                      <div className="flex flex-wrap items-center gap-1">
                        <DeliveryProviderBadge provider={getProviderFromRow(delivery)} size="sm" />
                        {delivery.deliveryType && <DeliveryTypeBadge deliveryType={delivery.deliveryType} size="sm" />}
                      </div>
                    </TableCell>
                    <TableCell className={compactTableCellClass}>
                      <DeliveryStatusBadge status={getStatusFromRow(delivery)} size="sm" />
                    </TableCell>
                    <TableCell className={cn(compactTableCellClass, "whitespace-nowrap")}>
                      <DeliveryTimeCell delivery={delivery} />
                    </TableCell>
                    <TableCell className={cn(compactTableCellClass, "truncate")}>
                      {delivery.riderName ? (
                        <span title={delivery.riderPhone ?? undefined}>
                          {delivery.riderName}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className={cn(compactTableCellClass, "text-right")}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(delivery); }}
                        className="h-8 px-2.5 text-xs text-indigo-600 hover:bg-indigo-50"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5">
              <p className="text-xs text-gray-500">
                {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-1.5 text-xs font-medium text-gray-600">
                  {pagination.page}/{pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

      <DeliveryDetailModal
        delivery={selectedDelivery}
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedDelivery(null); }}
        onUpdateStatus={readOnly ? undefined : handleStatusUpdate}
        onCancel={readOnly ? undefined : handleCancel}
        onRefresh={readOnly ? undefined : handleRefreshDelivery}
        onRetry={readOnly ? undefined : handleRetryDelivery}
        isUpdating={!!updatingId}
      />
    </div>
  );
}
