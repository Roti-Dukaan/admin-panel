"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertTriangle,
  IndianRupee,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  inHouseCodApi,
  type InHouseCodStop,
} from "../services/in-house-cod.api";
import { realtimeDispatchApi, type AssignableStaff } from "../services/realtime-dispatch.api";

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

function RiderHandoverPanel({
  rider,
  date,
  onDone,
}: {
  rider: AssignableStaff;
  date: string;
  onDone: () => void;
}) {
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["cod-rider", rider.id, date],
    queryFn: () => inHouseCodApi.getRiderSummary(rider.id, date),
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
      onDone();
    },
    onError: () => toast.error("Handover failed"),
  });

  const expected = data?.summary.pendingHandover ?? 0;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{rider.name ?? rider.email}</p>
          <p className="text-xs text-gray-500">
            {data?.summary.deliveryCount ?? 0} COD deliveries · ₹{expected} pending handover
          </p>
        </div>
        <Badge variant="outline">{rider.activeLoad} active</Badge>
      </div>

      {isLoading ? (
        <Loader2 className="mt-4 h-5 w-5 animate-spin text-gray-400" />
      ) : (
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-gray-50 p-2">
              <p className="text-xs text-gray-500">Expected</p>
              <p className="font-semibold">₹{data?.summary.expected ?? 0}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2">
              <p className="text-xs text-emerald-600">Collected</p>
              <p className="font-semibold text-emerald-700">₹{data?.summary.collected ?? 0}</p>
            </div>
          </div>
          <Input
            type="number"
            placeholder={`Received amount (expected ₹${expected})`}
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
            disabled={!amount || handoverMutation.isPending || expected === 0}
            onClick={() => handoverMutation.mutate()}
          >
            Record handover
          </Button>
        </div>
      )}
    </div>
  );
}

function MismatchRow({ stop, onOverride }: { stop: InHouseCodStop; onOverride: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
      <div>
        <p className="font-medium">{stop.orderNumber}</p>
        <p className="text-gray-600">
          Expected ₹{stop.codExpectedAmount} · Collected ₹{stop.codCollectedAmount}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={onOverride}>
        Override
      </Button>
    </div>
  );
}

export function CodReconciliationPanel() {
  const [date, setDate] = React.useState(() => format(new Date(), "yyyy-MM-dd"));
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["cod-summary", date],
    queryFn: () => inHouseCodApi.getSummary(date),
  });

  const assigneesQuery = useQuery({
    queryKey: ["dispatch-assignees"],
    queryFn: () => realtimeDispatchApi.getAssignees(),
  });

  const mismatchQuery = useQuery({
    queryKey: ["cod-mismatch", date],
    queryFn: () => inHouseCodApi.getMismatchOrders(date),
  });

  const overrideMutation = useMutation({
    mutationFn: ({ orderId, amount, note }: { orderId: string; amount: number; note?: string }) =>
      inHouseCodApi.codOverride(orderId, { collectedAmount: amount, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cod-mismatch"] });
      queryClient.invalidateQueries({ queryKey: ["cod-summary"] });
      toast.success("COD override applied");
    },
  });

  const refresh = () => {
    summaryQuery.refetch();
    mismatchQuery.refetch();
    assigneesQuery.refetch();
  };

  const totals = summaryQuery.data?.totals;
  const assignees = assigneesQuery.data ?? [];
  const mismatches = mismatchQuery.data ?? [];

  const handleOverride = (stop: InHouseCodStop) => {
    const amount = window.prompt("Override collected amount?", String(stop.codCollectedAmount ?? stop.codExpectedAmount));
    if (!amount) return;
    const note = window.prompt("Note?") ?? undefined;
    overrideMutation.mutate({ orderId: stop.orderId, amount: Number(amount), note });
  };

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

      {summaryQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Expected today" value={`₹${totals?.expected ?? 0}`} />
          <SummaryCard label="Collected" value={`₹${totals?.collected ?? 0}`} className="border-emerald-200 bg-emerald-50/50" />
          <SummaryCard label="Pending handover" value={`₹${totals?.pendingHandover ?? 0}`} className="border-amber-200 bg-amber-50/50" />
          <SummaryCard label="Reconciled" value={`₹${totals?.reconciled ?? 0}`} />
          <SummaryCard label="Mismatches" value={totals?.mismatches ?? 0} className="border-red-200 bg-red-50/50" />
          <SummaryCard label="Pending delivery" value={totals?.pendingDelivery ?? 0} />
        </div>
      )}

      {mismatches.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="font-semibold">COD mismatches ({mismatches.length})</h3>
          </div>
          {mismatches.map((stop) => (
            <MismatchRow key={stop.id} stop={stop} onOverride={() => handleOverride(stop)} />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <h3 className="font-semibold">End-of-day handover by rider</h3>
        </div>
        {assignees.length === 0 ? (
          <p className="text-sm text-gray-500">No delivery staff found.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {assignees.map((rider) => (
              <RiderHandoverPanel
                key={rider.id}
                rider={rider}
                date={date}
                onDone={() => {
                  queryClient.invalidateQueries({ queryKey: ["cod-rider", rider.id] });
                  refresh();
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
