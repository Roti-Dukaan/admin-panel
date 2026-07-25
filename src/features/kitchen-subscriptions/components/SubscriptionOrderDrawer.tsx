"use client";

import { X, User, Phone, MapPin, IndianRupee, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_STAGE_META } from "../types/kitchen-subscriptions";
import type { SubscriptionOrderDetail, SubscriptionKitchenStage } from "../types/kitchen-subscriptions";

export function SubscriptionOrderDrawer({
  order,
  onClose,
  onMarkReady,
  isUpdating,
}: {
  order: SubscriptionOrderDetail | null;
  onClose: () => void;
  onMarkReady: (id: string) => void;
  isUpdating: boolean;
}) {
  if (!order) return null;

  const meta = SUBSCRIPTION_STAGE_META[order.stage] ?? SUBSCRIPTION_STAGE_META.PREPARING;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-gray-900">🔁 {order.orderNumber}</p>
            <p className="text-xs text-gray-400">{order.subscriptionNumber}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.pillClass}`}>
              {meta.emoji} {meta.label}
            </span>
            <Badge variant="info">
              {order.mealSlot === "breakfast" ? "🌅" : order.mealSlot === "lunch" ? "☀️" : "🌙"}{" "}
              {order.mealSlot.charAt(0).toUpperCase() + order.mealSlot.slice(1)}
            </Badge>
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase text-gray-500">Customer</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {order.customerName}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {order.customerPhone}
              </div>
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="mb-2 text-xs font-bold uppercase text-gray-500">Delivery Address</h3>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <div>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p className="text-gray-500">
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase text-gray-500">Items</h3>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-start gap-1.5">
                    <span className="text-base leading-none">🍽️</span>
                    <span className="min-w-0">
                      <span className="font-medium text-gray-800">
                        {item.quantity} × {item.foodNameSnapshot}
                      </span>
                      {item.categorySnapshot && (
                        <span className="ml-1 text-xs text-gray-500">({item.categorySnapshot})</span>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 text-gray-600">
                    ₹{item.lineTotal.toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase text-gray-500">Pricing</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.pricing.subtotalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST</span>
                <span>₹{order.pricing.subtotalGSTAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>₹{order.pricing.deliveryCharge.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-1.5 font-bold text-gray-900">
                <span>Total</span>
                <span>₹{order.pricing.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Delivery Slot */}
          {order.deliverySlotName && (
            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="mb-2 text-xs font-bold uppercase text-gray-500">Delivery Window</h3>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                {order.deliverySlotName}
                {order.deliverySlotStart && order.deliverySlotEnd && (
                  <span className="text-gray-500">
                    ({order.deliverySlotStart} - {order.deliverySlotEnd})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <h3 className="mb-1 text-xs font-bold uppercase text-amber-700">Special Instructions</h3>
              <p className="text-sm text-amber-800">{order.specialInstructions}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          {order.stage === "READY" && (
            <Button
              type="button"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              disabled={isUpdating}
              onClick={() => onMarkReady(order.orderId)}
            >
              <ArrowRight className="h-4 w-4" />
              Mark Ready For Dispatch
            </Button>
          )}
          {order.stage === "PREPARING" && (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-sm font-medium text-amber-700">
              👨‍🍳 Currently Preparing
            </div>
          )}
          {order.stage === "READY_FOR_DISPATCH" && (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-200 bg-blue-50 px-3 py-2.5 text-center text-sm font-medium text-blue-700">
              📦 Ready For Dispatch
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
