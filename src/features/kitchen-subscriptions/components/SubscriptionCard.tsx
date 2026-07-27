"use client";

import { User, Phone, Clock, IndianRupee, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_STAGE_META } from "../types/kitchen-subscriptions";
import type { SubscriptionOrderListItem, SubscriptionKitchenStage } from "../types/kitchen-subscriptions";

export function SubscriptionCard({
  order,
  onOpen,
  onAction,
  isUpdating,
}: {
  order: SubscriptionOrderListItem;
  onOpen: () => void;
  onAction: () => void;
  isUpdating: boolean;
}) {
  const meta = SUBSCRIPTION_STAGE_META[order.stage] ?? SUBSCRIPTION_STAGE_META.PREPARING;

  const mealSlotEmoji = order.mealSlot === "breakfast" ? "🌅" : order.mealSlot === "lunch" ? "☀️" : "🌙";
  const mealSlotLabel = order.mealSlot.charAt(0).toUpperCase() + order.mealSlot.slice(1);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", meta.pillClass)}>
          <span>{meta.emoji}</span>
          {meta.label}
        </span>
        <Badge variant="info" className="gap-1">
          {mealSlotEmoji} {mealSlotLabel}
        </Badge>
      </div>

      <p className="mt-2 truncate text-sm font-bold tracking-tight text-gray-900">
        🔁 {order.orderNumber}
      </p>
      <p className="mt-0.5 text-xs text-gray-400">
        {order.subscriptionNumber}
      </p>

      <div className="mt-3 space-y-0.5">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <User className="h-3.5 w-3.5 text-gray-400" />
          <span className="truncate">{order.customerName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone className="h-3.5 w-3.5 text-gray-400" />
          <span>{order.customerPhone}</span>
        </div>
      </div>

      {order.deliverySlotName && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span>{order.deliverySlotName}</span>
          {order.deliverySlotStart && order.deliverySlotEnd && (
            <span className="text-gray-400">
              ({order.deliverySlotStart} - {order.deliverySlotEnd})
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
        <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
          <IndianRupee className="h-3.5 w-3.5" />
          {order.grandTotal.toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-gray-500">
          {order.itemsCount} item{order.itemsCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3">
        {order.stage === "PREPARING" && (
          <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-xs font-medium text-amber-700">
            👨‍🍳 Preparing
          </div>
        )}
        {order.stage === "READY" && (
          <Button
            type="button"
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
          >
            <ArrowRight className="h-4 w-4" />
            Ready For Dispatch
          </Button>
        )}
        {order.stage === "READY_FOR_DISPATCH" && (
          <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-200 bg-blue-50 px-3 py-2.5 text-center text-xs font-medium text-blue-700">
            📦 Ready For Dispatch
          </div>
        )}
      </div>
    </div>
  );
}
