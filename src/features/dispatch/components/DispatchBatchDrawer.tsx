"use client";

import { format } from "date-fns";
import { Truck, Package, MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISPATCH_STATUS_META, type DispatchBatchDetail } from "../types/dispatch";
import { cn } from "@/lib/utils";

interface Props {
  batch: DispatchBatchDetail | null;
  onClose: () => void;
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
            {batch.orders.map((order) => (
              <div
                key={order.orderId}
                className="rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                    {order.address && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        {order.address}
                      </p>
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
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
