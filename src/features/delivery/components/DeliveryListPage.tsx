"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { Delivery, DeliveryFilters, DeliveryStatus, DeliveryProvider } from "@/features/delivery/types/delivery";
import { DeliveryStatusBadge, DeliveryProviderBadge, DeliveryTypeBadge } from "./DeliveryStatusBadge";
import { DeliveryDetailModal } from "./DeliveryDetailModal";
import { deliveryApi } from "../services/delivery.api";
import { useDeliveriesRealtime } from "../hooks/useDeliveriesRealtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { DeliveryStats } from "./DeliveryStats";

type AdminAddress = {
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
};

function formatAddress(address?: AdminAddress): string {
  if (!address) return "";
  return [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    `${address.city}, ${address.state} - ${address.pincode}`,
  ]
    .filter((p): p is string => Boolean(p))
    .join(", ");
}

function customerName(delivery: Delivery): string {
  return delivery.order?.customer?.fullName ?? delivery.order?.customer?.name ?? "—";
}

function customerPhone(delivery: Delivery): string {
  return delivery.order?.customer?.phone ?? "—";
}

export function DeliveryListPage() {
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
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await deliveryApi.list(filters);
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
          const detail = await deliveryApi.getById(deepLinkId);
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
  }, [filters]);

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
    <div className="p-6 space-y-6">
        <DeliveryStats />

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search order #, customer, tracking..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={filters.status || "all"} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Providers" />
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
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
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
                className="w-[160px]"
                aria-label="Date from"
              />
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-[160px]"
                aria-label="Date to"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50">
                <TableHead className="w-32">Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="w-40">Provider</TableHead>
                <TableHead className="w-48">Status</TableHead>
                <TableHead className="w-48">Times</TableHead>
                <TableHead className="w-32">Rider</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-4 w-24 bg-gray-200 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-gray-200 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-gray-200 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-gray-200 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-gray-200 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-gray-200 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-gray-200 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No deliveries found
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(delivery)}>
                    <TableCell className="font-mono text-sm font-medium">{delivery.order?.orderNumber ?? delivery.orderId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customerName(delivery)}</p>
                        <p className="text-sm text-gray-500">{customerPhone(delivery)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <DeliveryProviderBadge provider={getProviderFromRow(delivery)} size="sm" />
                        {delivery.deliveryType && <DeliveryTypeBadge deliveryType={delivery.deliveryType} size="sm" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DeliveryStatusBadge status={getStatusFromRow(delivery)} size="sm" />
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="text-gray-600">
                        {delivery.estimatedPickupAt && (
                          <div className="flex items-center gap-1 text-amber-700">
                            <span className="text-xs">📦</span>
                            Pickup: {format(new Date(delivery.estimatedPickupAt), "HH:mm")}
                          </div>
                        )}
                        {delivery.estimatedDeliveryAt && (
                          <div className="flex items-center gap-1 text-indigo-700">
                            <span className="text-xs">🚚</span>
                            Deliver: {format(new Date(delivery.estimatedDeliveryAt), "HH:mm")}
                          </div>
                        )}
                        {delivery.actualDeliveryAt && (
                          <div className="flex items-center gap-1 text-emerald-700">
                            <span className="text-xs">✓</span>
                            Delivered: {format(new Date(delivery.actualDeliveryAt), "MMM d, HH:mm")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {delivery.riderName ? (
                        <div>
                          <p className="font-medium">{delivery.riderName}</p>
                          {delivery.riderPhone && (
                            <a href={`tel:${delivery.riderPhone}`} className="text-indigo-600 hover:underline text-xs">
                              {delivery.riderPhone}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(delivery); }}
                        className="text-indigo-600 hover:bg-indigo-50"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} deliveries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

      <DeliveryDetailModal
        delivery={selectedDelivery}
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedDelivery(null); }}
        onUpdateStatus={handleStatusUpdate}
        onCancel={handleCancel}
        onRefresh={handleRefreshDelivery}
        onRetry={handleRetryDelivery}
        isUpdating={!!updatingId}
      />
    </div>
  );
}
