"use client";

import * as React from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDriverMutations, useDriverRoute } from "../hooks/useDeliveryBoys";
import type { DriverDeliveryStop } from "../types/delivery-boys";
import { DISPATCH_STATUS_LABELS } from "../types/delivery-boys";
import { RealtimeDriverStops } from "@/features/realtime-dispatch/components/RealtimeDriverStops";

type Tab = "today" | "completed" | "failed";

function StopCard({
  stop,
  isNext,
  onAction,
  busy,
}: {
  stop: DriverDeliveryStop;
  isNext?: boolean;
  onAction: (action: "ARRIVED" | "DELIVERED" | "FAILED") => void;
  busy: boolean;
}) {
  const meta = DISPATCH_STATUS_LABELS[stop.dispatchStatus] ?? DISPATCH_STATUS_LABELS.ASSIGNED;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        isNext && "sticky top-0 z-10 border-orange-300 ring-2 ring-orange-200",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {stop.routeSequence != null && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
              {stop.routeSequence}
            </span>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{stop.customerName}</h3>
            <p className="text-xs text-gray-500">
              {stop.slot?.name ?? "Slot"}
              {stop.slot?.startTime ? ` · ${stop.slot.startTime}–${stop.slot.endTime}` : ""}
            </p>
          </div>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", meta.className)}>
          {meta.label}
        </span>
      </div>

      <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        {stop.address}
      </p>

      <div className="mt-2 space-y-0.5">
        {stop.items.map((item, i) => (
          <p key={i} className="text-xs text-gray-700">
            {item.quantity}× {item.name}
          </p>
        ))}
      </div>

      {stop.notes && <p className="mt-2 text-xs italic text-gray-500">Note: {stop.notes}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {stop.customerPhone && (
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={`tel:${stop.customerPhone}`}>
              <Phone className="mr-1 h-4 w-4" />
              Call
            </a>
          </Button>
        )}
        {stop.googleMapsUrl && (
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={stop.googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-1 h-4 w-4" />
              Maps
            </a>
          </Button>
        )}
        {stop.dispatchStatus === "ASSIGNED" && (
          <Button type="button" size="sm" disabled={busy} onClick={() => onAction("ARRIVED")}>
            Arrived
          </Button>
        )}
        {(stop.dispatchStatus === "ASSIGNED" || stop.dispatchStatus === "ARRIVED") && (
          <>
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={busy}
              onClick={() => onAction("DELIVERED")}
            >
              Delivered
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => onAction("FAILED")}
            >
              Failed
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

export function DriverRouteView() {
  const router = useRouter();
  const logout = useAdminAuthStore((s) => s.logout);
  const [date, setDate] = React.useState(() => format(new Date(), "yyyy-MM-dd"));
  const [tab, setTab] = React.useState<Tab>("today");
  const routeQuery = useDriverRoute(date, tab);
  const { updateStatus } = useDriverMutations();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const data = routeQuery.data;
  const progress = data?.progress ?? { assigned: 0, completed: 0, pending: 0, failed: 0 };

  const handleAction = async (stopId: string, status: "ARRIVED" | "DELIVERED" | "FAILED") => {
    try {
      if (status === "FAILED") {
        const reason = window.prompt("Failure reason?") ?? "Could not deliver";
        await updateStatus.mutateAsync({ id: stopId, status, failureReason: reason });
      } else {
        await updateStatus.mutateAsync({ id: stopId, status });
      }
      toast.success(status === "DELIVERED" ? "Marked delivered" : status === "ARRIVED" ? "Marked arrived" : "Marked failed");
    } catch {
      toast.error("Update failed");
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "completed", label: "Completed" },
    { id: "failed", label: "Failed / Attention" },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 pb-8">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Route</h1>
            <p className="text-xs text-gray-500">Subscription + realtime deliveries</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-1 h-4 w-4" />
            Logout
          </Button>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-3 h-10"
        />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-gray-100 py-2">
            <p className="font-bold text-gray-900">{progress.assigned}</p>
            <p className="text-gray-500">Assigned</p>
          </div>
          <div className="rounded-lg bg-emerald-50 py-2">
            <p className="font-bold text-emerald-700">{progress.completed}</p>
            <p className="text-emerald-600">Done</p>
          </div>
          <div className="rounded-lg bg-amber-50 py-2">
            <p className="font-bold text-amber-700">{progress.pending}</p>
            <p className="text-amber-600">Pending</p>
          </div>
        </div>
        {data?.pendingWarning && tab === "today" && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {progress.pending} stop(s) still pending — resolve before ending your route.
          </div>
        )}
      </header>

      <div className="flex gap-1 border-b border-gray-200 bg-white px-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-3 text-sm font-medium",
              tab === t.id ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-4">
        <RealtimeDriverStops tab={tab} />
        {routeQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (data?.stops ?? []).length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {tab === "today" ? "No pending stops for this date." : "Nothing here yet."}
          </div>
        ) : (
          <>
            {tab === "today" && data?.nextStop && (
              <div className="mb-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">Next stop</p>
                <StopCard
                  stop={data.nextStop}
                  isNext
                  busy={updateStatus.isPending}
                  onAction={(action) => handleAction(data.nextStop!.id, action)}
                />
              </div>
            )}
            {(data?.stops ?? [])
              .filter((s) => tab !== "today" || s.id !== data?.nextStop?.id)
              .map((stop) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  busy={updateStatus.isPending}
                  onAction={(action) => handleAction(stop.id, action)}
                />
              ))}
          </>
        )}

        {tab === "today" && progress.pending === 0 && progress.assigned > 0 && progress.failed === 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5" />
            All stops completed for today.
          </div>
        )}

        {tab === "failed" && progress.failed > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800">
            <XCircle className="h-5 w-5" />
            {progress.failed} failed — contact branch manager.
          </div>
        )}
      </div>
    </div>
  );
}
