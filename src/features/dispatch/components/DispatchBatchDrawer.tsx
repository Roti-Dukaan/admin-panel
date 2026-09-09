"use client";

import { format } from "date-fns";
import { Truck, Package, MapPin, X, CircleCheck, CircleX, Clock, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISPATCH_STATUS_META, type DispatchBatchDetail } from "../types/dispatch";
import { cn } from "@/lib/utils";
import { DELIVERY_STATUS_CONFIG } from "@/features/delivery/types/delivery";

interface Props {
  batch: DispatchBatchDetail | null;
  onClose: () => void;
}

function deliveryStatusIcon(status: string | null) {
  switch (status) {
    case "DELIVERED":
      return <CircleCheck className="h-4 w-4 text-emerald-500" />;
    case "CANCELLED":
    case "FAILED":
      return <CircleX className="h-4 w-4 text-red-500" />;
    case "OUT_FOR_DELIVERY":
    case "IN_TRANSIT":
      return <Navigation className="h-4 w-4 text-indigo-500" />;
    case "PICKED_UP":
      return <Truck className="h-4 w-4 text-amber-500" />;
    case "ASSIGNED":
    case "RIDER_ARRIVING":
    case "RIDER_ARRIVED":
      return <Clock className="h-4 w-4 text-violet-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

export function DispatchBatchDrawer({ batch, onClose }: Props) {
  if (!batch) return null;
  const meta = DISPATCH_STATUS_META[batch.status];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Batch #{batch.batchNumber}</h2>
            <p className="text-sm text-gray-500">Dispatch details</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <Badge className={`${meta.bg} ${meta.color} border-0`}>{meta.label}</Badge>
            {batch.provider && (
              <Badge className="bg-gray-100 text-gray-700 border-0 capitalize">{batch.provider}</Badge>
            )}
            {batch.deliveryZone && (
              <Badge className="bg-blue-50 text-blue-700 border-0">
                <MapPin className="mr-1 h-3 w-3" />
                {batch.deliveryZone}
              </Badge>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="font-semibold text-gray-900">{batch.totalOrders}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Assigned Riders</p>
              <p className="font-semibold text-gray-900">{batch.driverCount}</p>
            </div>
            {batch.estimatedPickupTime && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Est. Pickup</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(batch.estimatedPickupTime), "hh:mm a")}
                </p>
              </div>
            )}
            {batch.estimatedDeliveryWindow && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Est. Delivery Window</p>
                <p className="font-semibold text-gray-900">{batch.estimatedDeliveryWindow}</p>
              </div>
            )}
          </div>

          <h3 className="mt-6 text-sm font-semibold text-gray-900">Orders in Batch</h3>
          <div className="mt-3 space-y-2">
            {batch.orders.map((order) => {
              const deliveryMeta = order.deliveryStatus
                ? DELIVERY_STATUS_CONFIG[order.deliveryStatus as keyof typeof DELIVERY_STATUS_CONFIG]
                : null;
              return (
                <div
                  key={order.orderId}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        {deliveryMeta && (
                          <Badge className={`${deliveryMeta.bgClass} ${deliveryMeta.color} border-0 text-[10px]`}>
                            {deliveryMeta.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{order.customerName}</p>
                      {order.address && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {order.address}
                        </p>
                      )}
                      {order.deliveryStatus && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          {deliveryStatusIcon(order.deliveryStatus)}
                          <span>{order.deliveryStatus.replace(/_/g, " ")}</span>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline ml-2"
                            >
                              Track
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{order.grandTotal.toFixed(2)}</p>
                      {order.deliverySlotName && (
                        <p className="text-xs text-gray-500">{order.deliverySlotName}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
