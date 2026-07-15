"use client";

import { User, Phone, Zap, Clock, Package, IndianRupee, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PreparationTimer } from "./PreparationTimer";
import { STAGE_META, priorityBadge, getDeliveryKind, formatSlotWindow } from "../types/kitchen";
import type { KitchenOrderView } from "../types/kitchen";
import type { KitchenOrderDetail } from "@/lib/api/kitchen.api";

export function KitchenCard({
  order,
  detail,
  now,
  onOpen,
  onAction,
  isUpdating,
}: {
  order: KitchenOrderView;
  detail?: KitchenOrderDetail;
  now: number;
  onOpen: () => void;
  onAction: (action: "preparing" | "ready") => void;
  isUpdating: boolean;
}) {
  const meta = STAGE_META[order.kitchenStatus];
  const isScheduled = getDeliveryKind(order) === "scheduled";
  const slotWindow = formatSlotWindow(order.deliverySlot);
  const method = detail?.payment?.paymentMethod ?? order.paymentMethod ?? null;
  const isCod = method === "cod";
  const isPaid = method !== null && method !== "cod";
  const items = detail?.items ?? [];
  const specialNotes = detail?.specialInstructions;
  const badge = priorityBadge(order.priority);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", meta.pillClass)}>
          <span>{meta.emoji}</span>
          {meta.label}
        </span>
        <PreparationTimer order={order} now={now} size="sm" />
      </div>

      <p className="mt-2 truncate text-sm font-bold tracking-tight text-gray-900">{order.orderNumber}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badge.bgClass, badge.textClass)}>
          {badge.label}
        </span>
        {isPaid && <Badge variant="success" className="gap-1">PAID</Badge>}
        {isCod && <Badge variant="warning" className="gap-1">COD</Badge>}
        {isScheduled && slotWindow ? (
          <Badge variant="info" className="gap-1">
            <Clock className="h-3 w-3" />
            {slotWindow}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-sky-200 bg-sky-50 text-sky-700">
            <Zap className="h-3 w-3" />
            Quick
          </Badge>
        )}
      </div>

      <div className="mt-3 space-y-0.5">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <User className="h-3.5 w-3.5 text-gray-400" />
          <span className="truncate">{order.customer?.name ?? "Guest"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone className="h-3.5 w-3.5 text-gray-400" />
          <span>{order.customer?.phone ?? "—"}</span>
        </div>
      </div>

      <div className="mt-3 border-t border-black/5 pt-3">
        {items.length > 0 ? (
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-start gap-1.5">
                  <span className="text-base leading-none">🍽️</span>
                  <span className="min-w-0">
                    <span className="font-medium text-gray-800">
                      {item.quantity} × {item.foodNameSnapshot}
                    </span>
                    {item.categorySnapshot ? (
                      <span className="ml-1 text-xs text-gray-500">({item.categorySnapshot})</span>
                    ) : null}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-gray-500">
            <Package className="h-3.5 w-3.5" />
            {order.totalQuantity} item{order.totalQuantity === 1 ? "" : "s"}
          </p>
        )}

        {specialNotes ? (
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{specialNotes}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
        <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
          <IndianRupee className="h-3.5 w-3.5" />
          {detail ? detail.pricing.grandTotal.toLocaleString("en-IN") : "—"}
        </span>
        <span className="text-xs text-gray-500">
          {order.totalQuantity} item{order.totalQuantity === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3">
        {order.kitchenStatus === "PENDING" && (
          <Button
            type="button"
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              onAction("preparing");
            }}
          >
            <Play className="h-4 w-4" />
            Start Preparing
          </Button>
        )}
        {order.kitchenStatus === "PREPARING" && (
          <Button
            type="button"
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              onAction("ready");
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Ready For Pickup
          </Button>
        )}
        {order.kitchenStatus === "READY_FOR_PICKUP" && (
          <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Waiting for Delivery Assignment
          </div>
        )}
      </div>
    </div>
  );
}
