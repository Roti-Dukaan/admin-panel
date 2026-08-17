"use client";

import * as React from "react";
import { format } from "date-fns";
import { formatDeliverySlotLabel } from "@/lib/delivery-slot-display";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  Route,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useDriverSubscriptionMutations,
  useDriverSubscriptionRoutes,
} from "@/features/subscription-dispatch/hooks/useSubscriptionDispatch";
import type {
  SubscriptionRouteBatch,
  SubscriptionRouteBatchStop,
} from "@/features/subscription-dispatch/services/subscription-dispatch.api";
import { RealtimeDriverStops } from "@/features/realtime-dispatch/components/RealtimeDriverStops";

type Tab = "today" | "completed" | "failed" | "summary";

const STOP_STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "Assigned",
  ROUTE_READY: "Route ready",
  PICKED_UP: "Picked up",
  ARRIVED: "Arrived",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  CUSTOMER_UNAVAILABLE: "Unavailable",
  RESCHEDULED: "Rescheduled",
  UNASSIGNED: "Unassigned",
};

function getStopStatusLabel(stop: SubscriptionRouteBatchStop): string {
  if (isStopArrived(stop)) return "Arrived";
  const raw = stop.stopAssignmentStatus ?? stop.dispatchStatus ?? "";
  return STOP_STATUS_LABELS[raw] ?? raw.replace(/_/g, " ");
}

function isStopArrived(stop: SubscriptionRouteBatchStop): boolean {
  return stop.stopAssignmentStatus === "ARRIVED" || stop.dispatchStatus === "ARRIVED";
}

function SubscriptionStopCard({
  stop,
  isNext,
  onAction,
  busy,
}: {
  stop: SubscriptionRouteBatchStop;
  isNext?: boolean;
  onAction: (action: "ARRIVED" | "DELIVERED" | "FAILED" | "CUSTOMER_UNAVAILABLE") => void;
  busy: boolean;
}) {
  const status = getStopStatusLabel(stop);
  const statusKey = stop.stopAssignmentStatus ?? stop.dispatchStatus ?? "";

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
            {stop.deliveryNumber && (
              <p className="text-xs font-medium text-orange-700">Order ID: {stop.deliveryNumber}</p>
            )}
            <p className="text-xs text-gray-500">
              {stop.slot?.name ?? "Slot"}
              {stop.slot?.startTime
                ? ` · ${formatDeliverySlotLabel(stop.slot.startTime, stop.slot.endTime ?? stop.slot.startTime)}`
                : ""}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {status}
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
          <a href={`tel:${stop.customerPhone}`}>
            <Button size="sm" variant="outline" type="button">
              <Phone className="mr-1 h-4 w-4" />
              Call
            </Button>
          </a>
        )}
        {stop.googleMapsUrl && (
          <a href={stop.googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" type="button">
              <Navigation className="mr-1 h-4 w-4" />
              Maps
            </Button>
          </a>
        )}
        {!["DELIVERED", "FAILED", "CUSTOMER_UNAVAILABLE", "RESCHEDULED"].includes(statusKey) && (
          <>
            {!isStopArrived(stop) && (
              <Button type="button" size="sm" disabled={busy} onClick={() => onAction("ARRIVED")}>
                Arrived
              </Button>
            )}
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onAction("CUSTOMER_UNAVAILABLE")}
            >
              Unavailable
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

function RouteSummaryCard({ batch }: { batch: SubscriptionRouteBatch }) {
  const progress = batch.progress ?? {
    total: batch.stops.length,
    completed: 0,
    pending: batch.stops.length,
    failed: 0,
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
        <Route className="h-4 w-4" />
        Route summary
      </div>
      <p className="mt-1 text-xs text-indigo-800/80">
        {batch.deliverySlotName ?? "All slots"} · {progress.total} stops · {batch.totalQty} rotis
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-white py-2">
          <p className="font-bold text-emerald-700">{progress.completed}</p>
          <p className="text-gray-500">Done</p>
        </div>
        <div className="rounded-lg bg-white py-2">
          <p className="font-bold text-amber-700">{progress.pending}</p>
          <p className="text-gray-500">Pending</p>
        </div>
        <div className="rounded-lg bg-white py-2">
          <p className="font-bold text-red-700">{progress.failed}</p>
          <p className="text-gray-500">Failed</p>
        </div>
      </div>
      {batch.fullRouteUrl && (
        <a href={batch.fullRouteUrl} target="_blank" rel="noopener noreferrer">
          <Button type="button" size="sm" variant="outline" className="mt-3 w-full">
            <Navigation className="mr-1 h-4 w-4" />
            Open full route in Maps
          </Button>
        </a>
      )}
    </div>
  );
}

export function DriverSubscriptionRouteSection({ date }: { date: string }) {
  const routesQuery = useDriverSubscriptionRoutes(date);
  const { updateStopStatus } = useDriverSubscriptionMutations();
  const [tab, setTab] = React.useState<Tab>("today");
  const [activeBatchId, setActiveBatchId] = React.useState<string | null>(null);

  const batches = routesQuery.data ?? [];
  const activeBatch =
    batches.find((b) => b.id === activeBatchId) ?? batches[0] ?? null;

  React.useEffect(() => {
    if (batches.length > 0 && !activeBatchId) {
      setActiveBatchId(batches[0]!.id);
    }
  }, [batches, activeBatchId]);

  const allStops = batches.flatMap((b) => b.stops);
  const completed = allStops.filter(
    (s) => s.stopAssignmentStatus === "DELIVERED" || s.dispatchStatus === "DELIVERED",
  );
  const failed = allStops.filter(
    (s) =>
      ["FAILED", "CUSTOMER_UNAVAILABLE", "RESCHEDULED"].includes(s.stopAssignmentStatus ?? "") ||
      s.dispatchStatus === "FAILED",
  );
  const pending = allStops.filter(
    (s) =>
      !["DELIVERED", "FAILED", "CUSTOMER_UNAVAILABLE", "RESCHEDULED"].includes(
        s.stopAssignmentStatus ?? "",
      ) && s.dispatchStatus !== "DELIVERED" && s.dispatchStatus !== "FAILED",
  );

  const handleAction = async (
    stopId: string,
    status: "ARRIVED" | "DELIVERED" | "FAILED" | "CUSTOMER_UNAVAILABLE",
  ) => {
    try {
      if (status === "FAILED" || status === "CUSTOMER_UNAVAILABLE") {
        const reason =
          window.prompt("Reason?") ??
          (status === "CUSTOMER_UNAVAILABLE" ? "Customer unavailable" : "Could not deliver");
        await updateStopStatus.mutateAsync({ id: stopId, status, failureReason: reason });
      } else {
        await updateStopStatus.mutateAsync({ id: stopId, status });
      }
      toast.success("Stop updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "today", label: "Today's Route" },
    { id: "completed", label: "Completed" },
    { id: "failed", label: "Failed / Skipped" },
    { id: "summary", label: "Route Summary" },
  ];

  const displayStops =
    tab === "completed"
      ? completed
      : tab === "failed"
        ? failed
        : tab === "today"
          ? pending.sort((a, b) => (a.routeSequence ?? 999) - (b.routeSequence ?? 999))
          : [];

  const nextStop = pending.sort((a, b) => (a.routeSequence ?? 999) - (b.routeSequence ?? 999))[0];

  if (routesQuery.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
        No subscription route batches assigned for this date.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">Subscription routes</h2>
        {batches.length > 1 && (
          <select
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
            value={activeBatch?.id ?? ""}
            onChange={(e) => setActiveBatchId(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.deliverySlotName ?? "Route"} · {b.totalStops} stops
              </option>
            ))}
          </select>
        )}
      </div>

      {activeBatch?.pendingWarning && tab === "today" && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {activeBatch.progress?.pending ?? pending.length} stop(s) still pending.
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "whitespace-nowrap px-3 py-2 text-xs font-medium",
              tab === t.id ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && activeBatch && <RouteSummaryCard batch={activeBatch} />}

      {tab === "today" && nextStop && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">Next stop</p>
          <SubscriptionStopCard
            stop={nextStop}
            isNext
            busy={updateStopStatus.isPending}
            onAction={(action) => handleAction(nextStop.id, action)}
          />
        </div>
      )}

      {tab !== "summary" &&
        displayStops
          .filter((s) => tab !== "today" || s.id !== nextStop?.id)
          .map((stop) => (
            <SubscriptionStopCard
              key={stop.id}
              stop={stop}
              busy={updateStopStatus.isPending}
              onAction={(action) => handleAction(stop.id, action)}
            />
          ))}

      {tab === "today" && pending.length === 0 && allStops.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          All subscription stops completed.
        </div>
      )}

      {tab === "failed" && failed.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          <XCircle className="h-5 w-5" />
          {failed.length} failed or skipped — contact branch manager.
        </div>
      )}
    </div>
  );
}

export function DriverRouteView() {
  const router = useRouter();
  const logout = useAdminAuthStore((s) => s.logout);
  const [date, setDate] = React.useState(() => format(new Date(), "yyyy-MM-dd"));

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 pb-8">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Route</h1>
            <p className="text-xs text-gray-500">Subscription routes + realtime deliveries</p>
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
      </header>

      <div className="space-y-6 p-4">
        <DriverSubscriptionRouteSection date={date} />
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Live orders</h2>
          <RealtimeDriverStops date={date} />
        </div>
      </div>
    </div>
  );
}
