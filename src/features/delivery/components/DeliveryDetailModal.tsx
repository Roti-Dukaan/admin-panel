"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Phone, Truck, Clock, User, Package, Map, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import type { DeliveryTracking, DeliveryOrder, DeliveryAddress } from "@/features/delivery/types/delivery";
import { DeliveryStatusBadge, DeliveryProviderBadge } from "./DeliveryStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const STATUS_ORDER = [
  "WAITING_FOR_KITCHEN",
  "WAITING_FOR_PROVIDER",
  "PROVIDER_ASSIGNMENT_FAILED",
  "PROVIDER_ASSIGNED",
  "RIDER_ARRIVING",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
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
  DELIVERED: { icon: <CheckCircle className="w-4 h-4" />, color: "text-emerald-600", bgColor: "bg-emerald-100" },
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

    if (delivery.status === "OUT_FOR_DELIVERY" || delivery.status === "DELIVERED") {
      entries.push({
        status: "OUT_FOR_DELIVERY",
        timestamp: delivery.updatedAt,
        label: "Out for Delivery",
        details: "Package is on the way to customer",
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
  const canUpdate = delivery.status !== "DELIVERED" && delivery.status !== "FAILED" && delivery.status !== "CANCELLED";

  const renderTimelineTab = () => (
    <TabsContent value="timeline" className="space-y-4">
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
    <TabsContent value="details" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
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

      {(delivery.trackingUrl || delivery.riderTrackingUrl) && (
        <div className="flex justify-end gap-4">
          {delivery.riderTrackingUrl && (
            <a
              href={delivery.riderTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-600 hover:underline text-sm"
            >
              <Map className="w-4 h-4" />
              Live Rider Tracking
            </a>
          )}
          {delivery.trackingUrl && (
            <a
              href={delivery.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 hover:underline text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View on {delivery.provider} Tracking
            </a>
          )}
        </div>
      )}
    </TabsContent>
  );

  const renderMapTab = () => (
    <TabsContent value="map" className="space-y-4">
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Map className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Map view coming soon</p>
          <p className="text-sm">Integration with Google Maps / Mapbox</p>
        </div>
      </div>
      {delivery.riderName && delivery.webhookPayload && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <h5 className="font-medium mb-2">Last Known Location</h5>
          <pre className="overflow-auto max-h-40">{JSON.stringify(delivery.webhookPayload, null, 2)}</pre>
        </div>
      )}
    </TabsContent>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                Delivery Details
                <DeliveryStatusBadge status={delivery.status as any} size="md" />
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
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

          <DialogFooter className="p-4 border-t bg-gray-50 gap-3">
            {canUpdate && onUpdateStatus && (
              <div className="flex-1 flex items-center gap-3">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Update Status" />
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
                  placeholder="Remarks (optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full max-w-md"
                />
                <Button
                  onClick={() => selectedStatus && handleStatusUpdate(selectedStatus)}
                  disabled={!selectedStatus || isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => onRefresh?.()}
              disabled={!onRefresh || isUpdating}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              disabled={!canUpdate || isUpdating}
              className="text-red-600 hover:bg-red-50"
            >
              Cancel Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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