"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  ChefHat,
  Clock,
  MapPin,
  Phone,
  ShoppingBag,
  User,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { kitchenApi } from "@/lib/api/kitchen.api";
import type { BranchOrderNewPayload } from "@/lib/realtime/events";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  formatElapsedSince,
  formatOrderCurrency,
  formatPaymentMethod,
  isCodPayment,
  parseItemsSummary,
} from "../utils/order-alert-format";
import { cn } from "@/lib/utils";

interface NewOrderAlertModalProps {
  alert: BranchOrderNewPayload | null;
  open: boolean;
  /** How many additional new orders are waiting behind the one shown. */
  queuedCount: number;
  soundBlocked: boolean;
  preparing: boolean;
  onStartPreparing: () => void;
  onDismiss: () => void;
  onViewDetails: () => void;
  onEnableSound: () => void;
  enablingSound: boolean;
}

export function NewOrderAlertModal({
  alert,
  open,
  queuedCount,
  soundBlocked,
  preparing,
  onStartPreparing,
  onDismiss,
  onViewDetails,
  onEnableSound,
  enablingSound,
}: NewOrderAlertModalProps) {
  const [elapsedLabel, setElapsedLabel] = useState("Just now");

  const { data: detail } = useQuery({
    queryKey: ["kitchen", "alert-detail", alert?.orderId],
    queryFn: () => kitchenApi.getOrderDetail(alert!.orderId),
    enabled: open && !!alert?.orderId,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!open || !alert?.occurredAt) return;
    const tick = () => setElapsedLabel(formatElapsedSince(alert.occurredAt));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [open, alert?.occurredAt]);

  const itemLines =
    detail?.items?.map((item) => `${item.quantity}× ${item.foodNameSnapshot}`) ??
    (alert ? parseItemsSummary(alert.itemsSummary) : []);

  const customerName = detail?.customer?.name ?? detail?.address?.customerName;
  const customerPhone = detail?.customer?.phone ?? detail?.address?.phoneNumber;
  const deliveryType = detail?.deliveryType;
  const addressLine = detail?.address
    ? [detail.address.addressLine1, detail.address.landmark, detail.address.city]
        .filter(Boolean)
        .join(", ")
    : null;
  const paymentMethod = detail?.payment?.paymentMethod ?? alert?.paymentMethod;
  const cod = isCodPayment(paymentMethod);
  const grandTotal = detail?.pricing?.grandTotal ?? alert?.grandTotal ?? 0;
  const itemCount = detail?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? alert?.itemCount ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
    >
      <DialogPortal container={typeof document !== "undefined" ? document.body : undefined}>
        <DialogOverlay className="z-[200]" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[200] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden border-0 bg-white p-0 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl",
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-6 pb-8 pt-6 text-white">
          <div className="pointer-events-none absolute inset-0 animate-pulse bg-white/5" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30 backdrop-blur-sm">
                <BellRing className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-100">
                  New Order Received
                </p>
                <DialogTitle className="text-2xl font-bold text-white">
                  #{alert?.orderNumber ?? "—"}
                </DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-1.5 text-sm text-orange-100">
                  <Clock className="h-3.5 w-3.5" />
                  {elapsedLabel}
                </DialogDescription>
              </div>
            </div>
            <div
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                cod ? "bg-amber-300 text-amber-950" : "bg-emerald-300 text-emerald-950",
              )}
            >
              {cod ? "COD" : "Online"}
            </div>
          </div>
          {queuedCount > 0 && (
            <div
              aria-live="polite"
              className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/30"
            >
              <BellRing className="h-3.5 w-3.5" />
              +{queuedCount} more new order{queuedCount === 1 ? "" : "s"} waiting
            </div>
          )}
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Order total</p>
              <p className="text-3xl font-bold text-gray-900">{formatOrderCurrency(grandTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </p>
              <p className="text-xs font-medium text-gray-700">{formatPaymentMethod(paymentMethod)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              Items
            </div>
            <ul className="space-y-1.5">
              {itemLines.length > 0 ? (
                itemLines.map((line, index) => (
                  <li key={`${line}-${index}`} className="text-sm text-gray-700">
                    {line}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">Loading items…</li>
              )}
            </ul>
          </div>

          {(customerName || customerPhone || addressLine || deliveryType) && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-2">
              {customerName && (
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <User className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="font-medium">{customerName}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{customerPhone}</span>
                </div>
              )}
              {deliveryType && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ChefHat className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="capitalize">{deliveryType.replace(/_/g, " ").toLowerCase()}</span>
                </div>
              )}
              {addressLine && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span className="line-clamp-2">{addressLine}</span>
                </div>
              )}
            </div>
          )}

          {soundBlocked && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-3">
                <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-amber-900">Alert sound is muted</p>
                  <p className="mt-0.5 text-xs text-amber-800">
                    Enable sound so you hear every new order.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-amber-300 bg-white"
                    onClick={onEnableSound}
                    disabled={enablingSound}
                  >
                    {enablingSound ? "Enabling…" : "Enable Sound Now"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <Button
              size="lg"
              className="h-14 w-full rounded-xl bg-orange-500 text-base font-bold shadow-lg shadow-orange-200 hover:bg-orange-600"
              onClick={onStartPreparing}
              disabled={preparing || !alert}
              aria-label={`Start preparing order ${alert?.orderNumber ?? ""}`}
            >
              {preparing ? "Starting…" : "Start Preparing"}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={onViewDetails}
                disabled={!alert}
                aria-label={`View details for order ${alert?.orderNumber ?? ""}`}
              >
                View Details
              </Button>
              <Button
                variant="ghost"
                className="flex-1 rounded-xl text-gray-500"
                onClick={onDismiss}
                aria-label="Dismiss alert (sound continues until Start Preparing)"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
