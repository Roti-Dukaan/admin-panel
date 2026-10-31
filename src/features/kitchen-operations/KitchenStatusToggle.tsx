"use client";

import { useState } from "react";
import { Loader2, Power } from "lucide-react";
import { motion } from "motion/react";
import { useKitchenStatus, useUpdateKitchenStatus } from "./useKitchenOperations";
import type { KitchenStatusValue } from "@/lib/api/kitchen.api";
import { KitchenStatusBadge } from "./KitchenStatusBadge";
import { KitchenTemporaryCloseDialog } from "./KitchenTemporaryCloseDialog";
import { formatIstDateTime } from "@/lib/date";
import type { KitchenTemporaryClosePayload } from "./kitchen-closure.constants";

const STATUS_SUBTITLES: Record<KitchenStatusValue, string> = {
  OPEN: "Accepting orders",
  BUSY: "Accepting orders (busy)",
  CLOSED: "Closed for orders",
  MAINTENANCE: "Temporarily unavailable",
};

function isAcceptingOrders(status: KitchenStatusValue) {
  return status === "OPEN" || status === "BUSY";
}

export function KitchenStatusToggle() {
  const { data, isLoading, isError } = useKitchenStatus();
  const updateMutation = useUpdateKitchenStatus();
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const status = data?.status ?? "OPEN";
  const accepting = isAcceptingOrders(status);

  const handleToggle = () => {
    if (updateMutation.isPending) return;
    if (accepting) {
      setCloseDialogOpen(true);
      return;
    }
    updateMutation.mutate({
      status: "OPEN",
      busyDelayMinutes: data?.busyDelayMinutes,
      message: "",
    });
  };

  const handleConfirmClose = (payload: KitchenTemporaryClosePayload) => {
    updateMutation.mutate(
      {
        status: "CLOSED",
        busyDelayMinutes: data?.busyDelayMinutes,
        closureReasonCode: payload.closureReasonCode,
        closureReasonCustom: payload.closureReasonCustom,
        scheduledReopenAt: payload.scheduledReopenAt,
      },
      {
        onSuccess: () => setCloseDialogOpen(false),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-sm flex items-center justify-center min-h-[140px]">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Could not load kitchen status</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Kitchen Status</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">{status}</p>
              <KitchenStatusBadge status={status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">{STATUS_SUBTITLES[status]}</p>
            {!accepting && data.message ? (
              <p className="mt-2 text-sm text-gray-700 border-l-2 border-red-300 pl-2">{data.message}</p>
            ) : null}
            {!accepting && data.scheduledReopenAt ? (
              <p className="mt-1 text-xs text-gray-500">
                Auto-reopens: {formatIstDateTime(data.scheduledReopenAt)}
              </p>
            ) : null}
          </div>
          <div
            className={`rounded-xl p-3 ${
              accepting ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            <Power className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {accepting ? "Kitchen is ON" : "Kitchen is OFF"}
            </p>
            <p className="text-xs text-gray-500">
              {accepting ? "Customers can place orders" : "New orders are blocked"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={accepting}
            aria-label={accepting ? "Turn kitchen off" : "Turn kitchen on"}
            disabled={updateMutation.isPending}
            onClick={handleToggle}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              accepting ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                accepting ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </motion.div>

      <KitchenTemporaryCloseDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        initialReasonCode={data.closureReasonCode}
        initialCustom={data.closureReasonCustom}
        initialReopenAt={data.scheduledReopenAt}
        saving={updateMutation.isPending}
        onConfirm={handleConfirmClose}
      />
    </>
  );
}
