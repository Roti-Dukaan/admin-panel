"use client";

import { useState } from "react";
import { X, Phone, Truck, User, Package, Map, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import type { DeliveryTracking, DeliveryOrder, DeliveryAddress } from "@/features/delivery/types/delivery";
import { DeliveryStatusBadge, DeliveryProviderBadge } from "./DeliveryStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const STATUS_ORDER = [
  "WAITING_FOR_KITCHEN",
  "WAITING_FOR_PROVIDER",
  "PROVIDER_ASSIGNMENT_FAILED",
  "PROVIDER_ASSIGNED",
  "RIDER_ARRIVING",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "NEAR_CUSTOMER",
  "DELIVERED",
  "RETURNED",
  "FAILED",
  "CANCELLED",
] as const;

const TIMELINE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  WAITING_FOR_KITCHEN: { icon: <Package className="w-4 h-4" />, color: "text-amber-600", bgColor: "bg-amber-100" },
  WAITING_FOR_PROVIDER: { icon: <Package className="w-4 h-4" />, color: "text-orange-600", bgColor: "bg-orange-100" },
  PROVIDER_ASSIGNMENT_FAILED: { icon: <AlertCircle className="w-4 h-4" />, color: "text-rose-600", bgColor: "bg-rose-100" },
  PROVIDER_ASSIGNED: { icon: <User className="w-4 h-4" />, color: "text-blue-600", bgColor: "bg-blue-100" },
  RIDER_ARRIVING: { icon: <User className="w-4 h-4" />, color: "text-cyan-600", bgColor: "bg-cyan-100" },
  PICKED_UP: { icon: <Truck className="w-4 h-4" />, color: "text-purple-600", bgColor: "bg-purple-100" },
  OUT_FOR_DELIVERY: { icon: <Truck className="w-4 h-4" />, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  NEAR_CUSTOMER: { icon: <Truck className="w-4 h-4" />, color: "text-teal-600", bgColor: "bg-teal-100" },
  DELIVERED: { icon: <CheckCircle className="w-4 h-4" />, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  RETURNED: { icon: <AlertCircle className="w-4 h-4" />, color: "text-amber-600", bgColor: "bg-amber-100" },
  FAILED: { icon: <AlertCircle className="w-4 h-4" />, color: "text-red-600", bgColor: "bg-red-100" },
  CANCELLED: { icon: <X className="w-4 h-4" />, color: "text-gray-600", bgColor: "bg-gray-100" },
};

interface DeliveryDetailModalProps {
  delivery: (DeliveryTracking & { order?: DeliveryOrder }) | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (status: string, remarks?: string) => Promise<void>;
  onCancel?: (reason: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  onRetry?: () => Promise<void>;
  isUpdating?: boolean;
}

export function DeliveryDetailModal({
  delivery,
  isOpen,
  onClose,
  onUpdateStatus,
  onCancel,
  onRefresh,
  onRetry,
  isUpdating,
}: DeliveryDetailModalProps) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  if (!delivery || !isOpen) return null;

  const order = delivery.order;
  const address = order?.address;

  const getTimelineEntries = () => {
    const entries: Array<{ status: string; timestamp: string; label: string; details?: string }> = [];

    entries.push({
      status: delivery.deliveryType === "SCHEDULED" ? "WAITING_FOR_KITCHEN" : "WAITING_FOR_PROVIDER",
      timestamp: delivery.createdAt,
      label: "Order Placed",
      details: `Order ${order?.orderNumber} created`,
    });

    if (delivery.status === "PROVIDER_ASSIGNMENT_FAILED") {
      entries.push({
        status: "PROVIDER_ASSIGNMENT_FAILED",
        timestamp: delivery.lastAttemptAt ?? delivery.updatedAt,
        label: "Assignment Failed",
        details: delivery.assignmentFailedReason
          ? delivery.assignmentFailedReason
          : `Could not assign a ${delivery.provider} rider`,
      });
    }

    if (delivery.providerShipmentId) {
      entries.push({
        status: "PROVIDER_ASSIGNED",
        timestamp: delivery.providerAssignedAt ?? delivery.updatedAt,
        label: "Delivery Assigned",
        details: `Assigned to ${delivery.provider}`,
      });
    }

    if (delivery.actualPickupAt) {
      entries.push({
        status: "PICKED_UP",
        timestamp: delivery.actualPickupAt,
        label: "Picked Up",
        details: delivery.riderName ? `Picked up by ${delivery.riderName}` : "Package picked up from restaurant",
      });
    }

    if (delivery.status === "OUT_FOR_DELIVERY" || delivery.status === "NEAR_CUSTOMER" || delivery.status === "DELIVERED") {
      entries.push({
        status: "OUT_FOR_DELIVERY",
        timestamp: delivery.updatedAt,
        label: "Out for Delivery",
        details: "Package is on the way to customer",
      });
    }

    if (delivery.status === "NEAR_CUSTOMER" || delivery.status === "DELIVERED") {
      entries.push({
        status: "NEAR_CUSTOMER",
        timestamp: delivery.updatedAt,
        label: "Near Customer",
        details: "Rider is near the delivery location",
      });
    }

    if (delivery.actualDeliveryAt) {
      entries.push({
        status: "DELIVERED",
        timestamp: delivery.actualDeliveryAt,
        label: "Delivered",
        details: "Successfully delivered to customer",
      });
    }

    if (delivery.status === "FAILED") {
      entries.push({
        status: "FAILED",
        timestamp: delivery.updatedAt,
        label: "Delivery Failed",
        details: "Delivery attempt failed",
      });
    }

    if (delivery.status === "CANCELLED") {
      entries.push({
        status: "CANCELLED",
        timestamp: delivery.updatedAt,
        label: "Cancelled",
        details: "Delivery cancelled",
      });
    }

    if (delivery.status === "RETURNED") {
      entries.push({
        status: "RETURNED",
        timestamp: delivery.updatedAt,
        label: "Returned",
        details: "Package was returned",
      });
    }

    return entries.filter((e) => STATUS_ORDER.includes(e.status as any));
  };

  const timelineEntries = getTimelineEntries();
  const currentStatusIndex = timelineEntries.findIndex((e) => e.status === delivery.status);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onUpdateStatus) return;
    await onUpdateStatus(newStatus, remarks);
    setRemarks("");
  };

  const handleCancel = async () => {
    if (!cancelReason.trim() || !onCancel) return;
    await onCancel(cancelReason);
    setShowCancelDialog(false);
    setCancelReason("");
  };

  const nextStatus = STATUS_ORDER[Math.min(currentStatusIndex + 1, STATUS_ORDER.length - 1)];
  const canUpdate = delivery.status !== "DELIVERED" && delivery.status !== "FAILED" && delivery.status !== "CANCELLED" && delivery.status !== "RETURNED";

  const renderTimelineTab = () => (
    <TabsContent value="timeline" className="space-y-4 mt-4">
      <div className="relative">
        {timelineEntries.map((entry, index) => {
          const config = TIMELINE_CONFIG[entry.status] || TIMELINE_CONFIG.PENDING;
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;

          return (
            <div key={entry.status} className="flex gap-4 relative">
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 border-white ${
                    isActive ? config.color : "text-gray-300"
                  } ${isActive ? config.bgColor : "bg-gray-100"}`}
                >
                  {config.icon}
                </div>
                {index < timelineEntries.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-1 ${isActive ? config.color.replace("text", "bg") : "bg-gray-200"}`} />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className={`flex items-center gap-2 ${isCurrent ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                  <span className="text-sm">{entry.label}</span>
                  <span className="text-xs text-gray-400">{format(new Date(entry.timestamp), "MMM d, HH:mm")}</span>
                </div>
                {entry.details && (
                  <p className="text-sm text-gray-500 mt-1">{entry.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </TabsContent>
  );

  const renderDetailsTab = () => (
    <TabsContent value="details" className="space-y-6 mt-4">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Order Information</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Order Number</span><span className="font-mono font-medium">{order?.orderNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Delivery ID</span><span className="font-mono font-medium text-xs">{delivery.id}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Provider</span><DeliveryProviderBadge provider={delivery.provider as any} size="sm" /></div>
          {delivery.providerShipmentId && (
            <div className="flex justify-between"><span className="text-gray-500">Shipment ID</span><span className="font-mono text-xs font-medium">{delivery.providerShipmentId}</span></div>
          )}
          {delivery.trackingNumber && (
            <div className="flex justify-between"><span className="text-gray-500">Tracking #</span><span className="font-mono text-xs font-medium">{delivery.trackingNumber}</span></div>
          )}
          <div className="flex justify-between"><span className="text-gray-500">Created</span><span>{format(new Date(delivery.createdAt), "MMM d, yyyy HH:mm")}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Last Updated</span><span>{format(new Date(delivery.updatedAt), "MMM d, yyyy HH:mm")}</span></div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Timing</h4>
        <div className="space-y-3 text-sm">
          {delivery.estimatedPickupAt && (
            <div className="flex justify-between"><span className="text-gray-500">Est. Pickup</span><span>{format(new Date(delivery.estimatedPickupAt), "MMM d, HH:mm")}</span></div>
          )}
          {delivery.actualPickupAt && (
            <div className="flex justify-between text-amber-700"><span className="text-gray-500">Actual Pickup</span><span className="font-medium">{format(new Date(delivery.actualPickupAt), "MMM d, HH:mm")}</span></div>
          )}
          {delivery.estimatedDeliveryAt && (
            <div className="flex justify-between"><span className="text-gray-500">Est. Delivery</span><span>{format(new Date(delivery.estimatedDeliveryAt), "MMM d, HH:mm")}</span></div>
          )}
          {delivery.actualDeliveryAt && (
            <div className="flex justify-between text-emerald-700"><span className="text-gray-500">Actual Delivery</span><span className="font-medium">{format(new Date(delivery.actualDeliveryAt), "MMM d, HH:mm")}</span></div>
          )}
        </div>
      </div>

      {address && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 border-b pb-2">Delivery Address</h4>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-medium">{address.customerName}</p>
            <p className="text-sm text-gray-600">{address.phoneNumber}</p>
            <p className="text-sm text-gray-600 mt-1">{address.addressLine1}</p>
            {address.addressLine2 && <p className="text-sm text-gray-600">{address.addressLine2}</p>}
            {address.landmark && <p className="text-sm text-gray-500">Near: {address.landmark}</p>}
            <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
          </div>
        </div>
      )}

      {(delivery.riderName || delivery.riderPhone) && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 border-b pb-2">Rider Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
            {delivery.riderName && (
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{delivery.riderName}</p>
              </div>
            )}
            {delivery.riderPhone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a href={`tel:${delivery.riderPhone}`} className="font-medium text-indigo-600 hover:underline flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {delivery.riderPhone}
                </a>
              </div>
            )}
            {delivery.vehicleNumber && (
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-medium">{delivery.vehicleNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </TabsContent>
  );

  const renderMapTab = () => {
    const trackingUrl = delivery.trackingUrl;
    const payload = delivery.webhookPayload as Record<string, unknown> | undefined;

    return (
      <TabsContent value="map" className="space-y-4 mt-4">
        {trackingUrl ? (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Track on {delivery.provider}
          </a>
        ) : (
          <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <Map className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No tracking link available</p>
              <p className="text-sm mt-1">Tracking URL will appear once a courier is assigned</p>
            </div>
          </div>
        )}

        {payload && Object.keys(payload).length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h5 className="font-medium text-gray-900 mb-3">Provider Webhook Data</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {!!payload.status && (
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="font-medium">{String(payload.status)}</p>
                </div>
              )}
              {!!payload.order_status && (
                <div>
                  <span className="text-gray-500">Order Status</span>
                  <p className="font-medium">{String(payload.order_status)}</p>
                </div>
              )}
              {!!payload.courier_name && (
                <div>
                  <span className="text-gray-500">Courier</span>
                  <p className="font-medium">{String(payload.courier_name)}</p>
                </div>
              )}
              {!!payload.courier_phone && (
                <div>
                  <span className="text-gray-500">Courier Phone</span>
                  <p className="font-medium">{String(payload.courier_phone)}</p>
                </div>
              )}
              {!!payload.status_updated_at && (
                <div>
                  <span className="text-gray-500">Last Update</span>
                  <p className="font-medium">{String(payload.status_updated_at)}</p>
                </div>
              )}
              {!!payload.estimated_pickup_time && (
                <div>
                  <span className="text-gray-500">Est. Pickup</span>
                  <p className="font-medium">{String(payload.estimated_pickup_time)}</p>
                </div>
              )}
              {!!payload.estimated_delivery_time && (
                <div>
                  <span className="text-gray-500">Est. Delivery</span>
                  <p className="font-medium">{String(payload.estimated_delivery_time)}</p>
                </div>
              )}
            </div>

            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Raw JSON</summary>
              <pre className="mt-2 text-xs bg-white rounded-lg p-3 overflow-auto max-h-48 border border-gray-200">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </TabsContent>
    );
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between w-full">
            <DrawerTitle className="flex items-center gap-3">
              Delivery Details
              <DeliveryStatusBadge status={delivery.status as any} size="md" />
            </DrawerTitle>
            <DrawerClose onClick={onClose} />
          </div>
        </DrawerHeader>

        <DrawerContent>
          <div className="space-y-6">
            {delivery.status === "PROVIDER_ASSIGNMENT_FAILED" && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-800">Provider assignment failed</p>
                  <p className="text-sm text-rose-700 mt-1">
                    {delivery.assignmentFailedReason ?? `No ${delivery.provider} rider could be assigned.`}
                  </p>
                  {typeof delivery.providerAttempts === "number" && delivery.providerAttempts > 0 && (
                    <p className="text-xs text-rose-600 mt-1">{delivery.providerAttempts} attempt(s) made</p>
                  )}
                </div>
                {onRetry && (
                  <Button
                    size="sm"
                    onClick={() => onRetry()}
                    disabled={isUpdating}
                    className="gap-2 bg-rose-600 hover:bg-rose-700"
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
                    Retry
                  </Button>
                )}
              </div>
            )}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>
              {renderTimelineTab()}
              {renderDetailsTab()}
              {renderMapTab()}
            </Tabs>
          </div>
        </DrawerContent>

        <DrawerFooter className="border-t px-6 py-3">
          <div className="flex items-center gap-2">
            {canUpdate && onUpdateStatus && (
              <>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER
                      .filter((s) => s !== delivery.status && s !== "CANCELLED" && s !== "FAILED")
                      .map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="flex-1 h-8 text-xs min-w-0"
                />
                <Button
                  size="sm"
                  onClick={() => selectedStatus && handleStatusUpdate(selectedStatus)}
                  disabled={!selectedStatus || isUpdating}
                  className="h-8 shrink-0"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
                <div className="w-px h-5 bg-gray-200 shrink-0" />
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRefresh?.()}
              disabled={!onRefresh || isUpdating}
              className="h-8 gap-1 text-xs shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isUpdating ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              disabled={!canUpdate || isUpdating}
              className="h-8 text-xs text-red-600 hover:bg-red-50 shrink-0"
            >
              Cancel
            </Button>
          </div>
        </DrawerFooter>
      </Drawer>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">Please provide a reason for cancelling this delivery.</p>
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Enter cancellation reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isUpdating}>
              Keep Active
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason.trim() || isUpdating}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
