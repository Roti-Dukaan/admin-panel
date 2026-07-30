"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertTriangle,
  IndianRupee,
  Loader2,
  Phone,
  RefreshCw,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  inHouseCodApi,
  type CodHandoverFilter,
  type CodRiderRollup,
  type CodSummary,
  type InHouseCodStop,
} from "../services/in-house-cod.api";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-white p-4 shadow-sm", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function riderMatchesFilter(rider: CodRiderRollup, filter: CodHandoverFilter): boolean {
  switch (filter) {
    case "pending_collection":
      return rider.pendingCollectionCount > 0;
    case "pending_handover":
      return rider.pendingHandover > 0 || (rider.awaitingReconcileAmount ?? 0) > 0;
    case "reconciled":
      return (
        rider.reconciledAmount > 0 &&
        rider.pendingHandover === 0 &&
        (rider.awaitingReconcileAmount ?? 0) === 0 &&
        rider.pendingCollectionCount === 0
      );
    default:
      return true;
  }
}

function groupPendingHandoverByRider(
  orders: CodSummary["pendingHandoverOrders"],
): Array<{
  riderId: string | null;
  riderName: string;
  riderPhone: string | null;
  total: number;
  orders: CodSummary["pendingHandoverOrders"];
}> {
  const map = new Map<
    string,
    {
      riderId: string | null;
      riderName: string;
      riderPhone: string | null;
      orders: CodSummary["pendingHandoverOrders"];
    }
  >();

  for (const order of orders) {
    const key = order.riderId ?? order.riderName ?? "unassigned";
    const existing = map.get(key) ?? {
      riderId: order.riderId,
      riderName: order.riderName ?? "Unassigned rider",
      riderPhone: order.riderPhone,
      orders: [],
    };
    existing.orders.push(order);
    if (!existing.riderPhone && order.riderPhone) existing.riderPhone = order.riderPhone;
    map.set(key, existing);
  }

  return [...map.values()]
    .map((group) => ({
      ...group,
      total: group.orders.reduce((sum, o) => sum + o.amount, 0),
    }))
    .sort((a, b) => b.total - a.total);
}

function RiderStatusBadge({ rider }: { rider: CodRiderRollup }) {
  if (rider.pendingCollectionCount > 0) {
    return (
      <Badge variant="destructive">
        {rider.pendingCollectionCount} pending collection
      </Badge>
    );
  }
  if (rider.pendingHandover > 0) {
    return <Badge variant="default">₹{rider.pendingHandover} to hand over</Badge>;
  }
  if ((rider.awaitingReconcileAmount ?? 0) > 0) {
    return <Badge variant="secondary">₹{rider.awaitingReconcileAmount} handover recorded</Badge>;
  }
  if (rider.reconciledAmount > 0) {
    return <Badge variant="outline">Reconciled</Badge>;
  }
  return <Badge variant="outline">No COD activity</Badge>;
}

function RiderHandoverPanel({
  rider,
  date,
  branchId,
  onDone,
}: {
  rider: CodRiderRollup;
  date: string;
  branchId?: string | null;
  onDone: () => void;
}) {
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["cod-rider", rider.id, date, branchId],
    queryFn: () => inHouseCodApi.getRiderSummary(rider.id, { date, branchId }),
  });

  const handoverMutation = useMutation({
    mutationFn: () =>
      inHouseCodApi.recordHandover(rider.id, {
        receivedAmount: Number(amount),
        note: note || undefined,
        date,
      }),
    onSuccess: (result: { mismatch?: boolean }) => {
      toast.success(result.mismatch ? "Handover recorded with mismatch" : "Handover recorded");
      setAmount("");
      setNote("");
      onDone();
    },
    onError: (err: Error) => toast.error(err?.message || "Handover failed"),
  });

  const reconcileMutation = useMutation({
    mutationFn: () => inHouseCodApi.reconcileHandover(rider.id, { date }),
    onSuccess: () => {
      toast.success("COD reconciled");
      onDone();
    },
    onError: (err: Error) => toast.error(err?.message || "Reconciliation failed"),
  });

  const pendingHandover = data?.summary.pendingHandover ?? rider.pendingHandover;
  const awaitingReconcile = rider.awaitingReconcileAmount ?? 0;
  const deliveryCount = data?.summary.deliveryCount ?? rider.deliveryCount;
  const handoverOrders =
    data?.deliveries.filter((d) => d.riderWorkflowStatus === "cash_handover_pending") ?? [];

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 font-semibold">
            <User className="h-4 w-4 text-orange-600" />
            {rider.name ?? rider.email}
          </p>
          <p className="text-xs text-gray-500">
            {deliveryCount} COD deliveries
            {rider.pendingCollectionCount > 0
              ? ` · ${rider.pendingCollectionCount} awaiting collection (₹${rider.pendingCollectionAmount})`
              : null}
            {pendingHandover > 0 ? ` · ₹${pendingHandover} pending handover` : null}
          </p>
        </div>
        <RiderStatusBadge rider={rider} />
      </div>

      {isLoading ? (
        <Loader2 className="mt-4 h-5 w-5 animate-spin text-gray-400" />
      ) : (
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-gray-50 p-2">
              <p className="text-xs text-gray-500">Expected</p>
              <p className="font-semibold">₹{data?.summary.expected ?? rider.expected}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2">
              <p className="text-xs text-emerald-600">Collected</p>
              <p className="font-semibold text-emerald-700">
                ₹{data?.summary.collected ?? rider.collected}
              </p>
            </div>
          </div>

          {rider.pendingCollectionCount > 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {rider.pendingCollectionCount} order(s) still out for COD collection. Handover only
              applies to delivered orders.
            </p>
          )}

          {pendingHandover > 0 ? (
            <>
              {handoverOrders.length > 0 && (
                <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-2">
                  <p className="mb-1 text-xs font-medium text-amber-900">Collect from this driver</p>
                  <ul className="space-y-1 text-xs text-gray-700">
                    {handoverOrders.map((order) => (
                      <li key={order.id} className="flex justify-between gap-2">
                        <span>{order.orderNumber}</span>
                        <span className="font-medium">₹{order.codCollectedAmount ?? order.codExpectedAmount ?? 0}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Input
                type="number"
                placeholder={`Received amount (expected ₹${pendingHandover})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                size="sm"
                disabled={!amount || handoverMutation.isPending}
                onClick={() => handoverMutation.mutate()}
              >
                Record handover
              </Button>
            </>
          ) : rider.pendingCollectionCount === 0 && awaitingReconcile > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Handover recorded (₹{awaitingReconcile}) — confirm reconciliation to close these orders.
              </p>
              <Button
                size="sm"
                disabled={reconcileMutation.isPending}
                onClick={() => reconcileMutation.mutate()}
              >
                Confirm reconciliation
              </Button>
            </div>
          ) : rider.pendingCollectionCount === 0 && rider.reconciledAmount > 0 ? (
            <p className="text-sm text-gray-500">All COD for this rider is reconciled.</p>
          ) : rider.pendingCollectionCount === 0 ? (
            <p className="text-sm text-gray-500">No pending COD handover for this rider.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function OverrideModal({
  stop,
  open,
  onClose,
  onConfirm,
  busy,
}: {
  stop: InHouseCodStop;
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, note?: string) => void;
  busy: boolean;
}) {
  const [amount, setAmount] = React.useState(
    String(stop.codCollectedAmount ?? stop.codExpectedAmount ?? ""),
  );
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setAmount(String(stop.codCollectedAmount ?? stop.codExpectedAmount ?? ""));
      setNote("");
    }
  }, [open, stop]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Override COD — {stop.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">
            Expected ₹{stop.codExpectedAmount} · Rider collected ₹{stop.codCollectedAmount}
          </p>
          <div>
            <Label htmlFor="override-amount">Accepted amount</Label>
            <Input
              id="override-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="override-note">Note (optional)</Label>
            <Input id="override-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <p className="text-xs text-gray-500">
            Manager override marks the amount as accepted and removes this from mismatches.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            disabled={busy || !amount}
            onClick={() => onConfirm(Number(amount), note || undefined)}
          >
            Confirm override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MismatchRow({
  stop,
  onOverride,
}: {
  stop: InHouseCodStop;
  onOverride: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
      <div>
        <p className="font-medium">{stop.orderNumber}</p>
        <p className="text-gray-600">
          Driver: {stop.assigneeName ?? "Unassigned"} · Expected ₹{stop.codExpectedAmount} · Collected ₹
          {stop.codCollectedAmount}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={onOverride}>
        Override
      </Button>
    </div>
  );
}

const HANDOVER_FILTERS: { id: CodHandoverFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending_collection", label: "Pending collection" },
  { id: "pending_handover", label: "Pending handover" },
  { id: "reconciled", label: "Reconciled" },
];

export function CodReconciliationPanel() {
  const [date, setDate] = React.useState(() => format(new Date(), "yyyy-MM-dd"));
  const [handoverFilter, setHandoverFilter] = React.useState<CodHandoverFilter>("pending_handover");
  const [overrideStop, setOverrideStop] = React.useState<InHouseCodStop | null>(null);
  const queryClient = useQueryClient();
  const branchId = useAdminAuthStore((s) => s.branchId);
  const apiParams = React.useMemo(() => ({ date, branchId }), [date, branchId]);

  const summaryQuery = useQuery({
    queryKey: ["cod-summary", date, branchId],
    queryFn: () => inHouseCodApi.getSummary(apiParams),
  });

  const mismatchQuery = useQuery({
    queryKey: ["cod-mismatch", date, branchId],
    queryFn: () => inHouseCodApi.getMismatchOrders(apiParams),
  });

  const overrideMutation = useMutation({
    mutationFn: ({ orderId, amount, note }: { orderId: string; amount: number; note?: string }) =>
      inHouseCodApi.codOverride(orderId, { collectedAmount: amount, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cod-mismatch"] });
      queryClient.invalidateQueries({ queryKey: ["cod-summary"] });
      queryClient.invalidateQueries({ queryKey: ["cod-rider"] });
      setOverrideStop(null);
      toast.success("COD override applied");
    },
    onError: (err: Error) => toast.error(err?.message || "Override failed"),
  });

  const refresh = () => {
    summaryQuery.refetch();
    mismatchQuery.refetch();
    queryClient.invalidateQueries({ queryKey: ["cod-rider"] });
    queryClient.invalidateQueries({ queryKey: ["realtime-driver"] });
  };

  const totals = summaryQuery.data?.totals;
  const allRiders = summaryQuery.data?.riders ?? [];
  const pendingHandoverOrders = summaryQuery.data?.pendingHandoverOrders ?? [];
  const handoverByRider = React.useMemo(
    () => groupPendingHandoverByRider(pendingHandoverOrders),
    [pendingHandoverOrders],
  );
  const riders = allRiders.filter((r) => riderMatchesFilter(r, handoverFilter));
  const ridersAwaitingConfirm = allRiders.filter((r) => (r.awaitingReconcileAmount ?? 0) > 0);
  const mismatches = mismatchQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">COD Reconciliation</h2>
          <p className="text-sm text-gray-500">In-house realtime deliveries only</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {ridersAwaitingConfirm.length > 0 && (
        <section className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
            <div className="space-y-1">
              <p className="font-semibold text-teal-900">
                {ridersAwaitingConfirm.length} rider(s) waiting for your confirmation
              </p>
              <p className="text-sm text-teal-800">
                Cash was recorded but not fully reconciled. Open each rider card below and click{" "}
                <strong>Confirm reconciliation</strong> — or switch to the{" "}
                <strong>Pending handover</strong> filter.
              </p>
            </div>
          </div>
        </section>
      )}

      {summaryQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Expected today" value={`₹${totals?.expected ?? 0}`} />
          <SummaryCard label="Collected" value={`₹${totals?.collected ?? 0}`} className="border-emerald-200 bg-emerald-50/50" />
          <SummaryCard label="Pending handover" value={`₹${totals?.pendingHandover ?? 0}`} className="border-amber-200 bg-amber-50/50" />
          <SummaryCard label="Awaiting confirm" value={`₹${totals?.awaitingReconcile ?? 0}`} className="border-teal-200 bg-teal-50/50" />
          <SummaryCard label="Reconciled" value={`₹${totals?.reconciled ?? 0}`} />
          <SummaryCard label="Mismatches" value={totals?.mismatches ?? 0} className="border-red-200 bg-red-50/50" />
          <SummaryCard label="Pending delivery" value={totals?.pendingDelivery ?? 0} />
        </div>
      )}

      {handoverByRider.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-semibold text-amber-800">
            Collect cash from drivers ({handoverByRider.length})
          </h3>
          {handoverByRider.map((group) => (
            <div
              key={group.riderId ?? group.riderName}
              className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
                    <User className="h-4 w-4 text-orange-600" />
                    {group.riderName}
                  </p>
                  {group.riderPhone && (
                    <a
                      href={`tel:${group.riderPhone}`}
                      className="mt-0.5 flex items-center gap-1 text-xs text-gray-600 hover:text-orange-700"
                    >
                      <Phone className="h-3 w-3" />
                      {group.riderPhone}
                    </a>
                  )}
                </div>
                <Badge className="bg-amber-600 hover:bg-amber-600">
                  Collect ₹{group.total}
                </Badge>
              </div>
              <ul className="mt-3 space-y-1 border-t border-amber-200/80 pt-3 text-sm">
                {group.orders.map((order) => (
                  <li key={order.deliveryId} className="flex justify-between gap-2 text-gray-700">
                    <span>{order.orderNumber}</span>
                    <span className="font-medium">₹{order.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {mismatches.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="font-semibold">COD mismatches ({mismatches.length})</h3>
          </div>
          {mismatches.map((stop) => (
            <MismatchRow key={stop.id} stop={stop} onOverride={() => setOverrideStop(stop)} />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold">End-of-day handover by rider</h3>
          </div>
          <div className="flex flex-wrap gap-1">
            {HANDOVER_FILTERS.map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={handoverFilter === f.id ? "default" : "outline"}
                onClick={() => setHandoverFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {allRiders.length === 0 ? (
          <p className="text-sm text-gray-500">No COD deliveries for this date.</p>
        ) : riders.length === 0 ? (
          <p className="text-sm text-gray-500">No riders match this filter.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {riders.map((rider) => (
              <RiderHandoverPanel
                key={rider.id}
                rider={rider}
                date={date}
                branchId={branchId}
                onDone={() => {
                  queryClient.invalidateQueries({ queryKey: ["cod-rider", rider.id] });
                  refresh();
                }}
              />
            ))}
          </div>
        )}
      </section>

      {overrideStop && (
        <OverrideModal
          stop={overrideStop}
          open={!!overrideStop}
          onClose={() => setOverrideStop(null)}
          busy={overrideMutation.isPending}
          onConfirm={(amount, note) =>
            overrideMutation.mutate({ orderId: overrideStop.orderId, amount, note })
          }
        />
      )}
    </div>
  );
}
