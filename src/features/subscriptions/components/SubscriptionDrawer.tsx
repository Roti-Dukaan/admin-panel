"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  X,
  CalendarDays,
  Clock,
  MapPin,
  Ban,
  RefreshCw,
  History,
  CalendarRange,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscriptionStatusBadge, OccurrenceStatusBadge } from "./StatusBadge";
import { useSubscriptionsStore, useCancelSubscription } from "../hooks/useSubscriptions";
import {
  FREQUENCY_LABELS,
  type SubscriptionEntity,
  type SubscriptionOccurrence,
  type SubscriptionTimelineEntry,
} from "../types/subscription";

function fmt(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Tab = "overview" | "occurrences" | "timeline";

export function SubscriptionDrawer() {
  const open = useSubscriptionsStore((s) => s.drawerOpen);
  const sub = useSubscriptionsStore((s) => s.selectedSubscription);
  const setOpen = useSubscriptionsStore((s) => s.setDrawerOpen);
  const setSelected = useSubscriptionsStore((s) => s.setSelectedSubscription);
  const occurrences = useSubscriptionsStore((s) => s.occurrences);
  const timeline = useSubscriptionsStore((s) => s.timeline);
  const loadingOccurrences = useSubscriptionsStore((s) => s.loadingOccurrences);
  const loadingTimeline = useSubscriptionsStore((s) => s.loadingTimeline);
  const loadOccurrences = useSubscriptionsStore((s) => s.loadOccurrences);
  const loadTimeline = useSubscriptionsStore((s) => s.loadTimeline);
  const cancel = useCancelSubscription();

  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (open && sub) {
      loadOccurrences(sub.id);
      loadTimeline(sub.id);
      setTab("overview");
    }
  }, [open, sub, loadOccurrences, loadTimeline]);

  const close = () => {
    setOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  const handleCancel = async () => {
    if (!sub) return;
    if (!confirm("Cancel this subscription? This will stop all future deliveries.")) return;
    await cancel.mutateAsync({ id: sub.id, reason: "Cancelled by admin" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {sub && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between pr-8">
                <div>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    {sub.customer?.fullName || sub.customer?.name || "Customer"}
                    <SubscriptionStatusBadge status={sub.status} />
                  </DialogTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    {sub.planName} · {FREQUENCY_LABELS[sub.frequency]}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
              {(
                [
                  { key: "overview", label: "Overview", icon: Package },
                  { key: "occurrences", label: "Occurrences", icon: CalendarRange },
                  { key: "timeline", label: "Timeline", icon: History },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {tab === "overview" && <OverviewTab sub={sub} onCancel={handleCancel} cancelling={cancel.isPending} />}
              {tab === "occurrences" && (
                <OccurrencesTab occurrences={occurrences} loading={loadingOccurrences} />
              )}
              {tab === "timeline" && <TimelineTab timeline={timeline} loading={loadingTimeline} />}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OverviewTab({
  sub,
  onCancel,
  cancelling,
}: {
  sub: SubscriptionEntity;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const meals = (sub.meals as any)?.slots ?? [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <InfoCard icon={CalendarDays} label="Start Date" value={formatDate(sub.startDate)} />
        <InfoCard icon={CalendarDays} label="End Date" value={formatDate(sub.endDate)} />
        <InfoCard icon={Clock} label="Next Delivery" value={formatDate(sub.nextOccurrenceDate)} />
        <InfoCard icon={RefreshCw} label="Occurrences Generated" value={String(sub.occurrencesGenerated)} />
        <InfoCard icon={Ban} label="Skipped Count" value={String(sub.skippedCount)} />
        <InfoCard icon={Package} label="Quantity" value={String(sub.quantity)} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Meals</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {meals.length > 0 ? (
            meals.map((m: string) => (
              <Badge key={m} variant="secondary">
                {m}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Delivery</p>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gray-400" /> {sub.deliverySlot?.name || "No slot"}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            {sub.address
              ? `${sub.address.line1 || ""}, ${sub.address.city || ""} ${sub.address.pincode || ""}`.trim()
              : "No address"}
          </div>
        </div>

        {sub.vacationStart && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
            <CalendarRange className="h-3.5 w-3.5" />
            Vacation: {formatDate(sub.vacationStart)} → {formatDate(sub.vacationEnd)}
          </div>
        )}
        {sub.pausedReason && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Paused: {sub.pausedReason}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={cancelling || sub.status === "CANCELLED"}>
          {cancelling ? "Cancelling…" : "Cancel Subscription"}
        </Button>
      </div>
    </div>
  );
}

function OccurrencesTab({
  occurrences,
  loading,
}: {
  occurrences: SubscriptionOccurrence[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="py-10 text-center text-sm text-gray-400">Loading occurrences…</div>;
  }
  if (occurrences.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">No occurrences yet.</div>
    );
  }
  return (
    <div className="space-y-2">
      {occurrences.map((occ) => (
        <motion.div
          key={occ.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">{formatDate(occ.occurrenceDate)}</p>
            <p className="text-xs text-gray-400">
              {occ.mealSlot} · Qty {occ.quantity}
              {occ.orderId ? ` · Order ${occ.orderId.slice(0, 8)}` : ""}
            </p>
          </div>
          <OccurrenceStatusBadge status={occ.status} />
        </motion.div>
      ))}
    </div>
  );
}

function TimelineTab({
  timeline,
  loading,
}: {
  timeline: SubscriptionTimelineEntry[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="py-10 text-center text-sm text-gray-400">Loading timeline…</div>;
  }
  if (timeline.length === 0) {
    return <div className="py-10 text-center text-sm text-gray-400">No timeline entries.</div>;
  }
  return (
    <div className="relative space-y-4 border-l border-gray-200 pl-5">
      {timeline.map((t) => (
        <div key={t.id} className="relative">
          <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-orange-400 ring-4 ring-orange-50" />
          <p className="text-sm font-medium text-gray-800">{t.title}</p>
          {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
          <p className="text-[11px] text-gray-400">
            {fmt(t.occurredAt)} · {t.actorType}
          </p>
        </div>
      ))}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

// Local useState import kept at the top
