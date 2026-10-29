"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Loader2, MapPin, Navigation, Phone, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { inHouseRiderApi, type InHouseCodStop } from "@/features/realtime-dispatch/services/in-house-cod.api";
import { CodQrModal } from "@/features/realtime-dispatch/components/CodQrModal";

type Tab = "today" | "completed" | "failed";

const TODAY_VISIBLE_WORKFLOWS = new Set([
  "assigned",
  "picked_up",
  "arrived",
  "cash_collection_pending",
  "cash_collected",
  "cash_handover_pending",
]);

const COD_COLLECTED_STATUSES = new Set([
  "COLLECTED",
  "CASH_COLLECTED",
  "QR_PAID",
  "MISMATCH",
]);

function isCodCollected(status: InHouseCodStop["codCollectionStatus"]): boolean {
  return !!status && COD_COLLECTED_STATUSES.has(status);
}

const WORKFLOW_LABELS: Record<string, { label: string; className: string }> = {
  assigned: { label: "Assigned", className: "bg-blue-100 text-blue-800" },
  picked_up: { label: "Picked up", className: "bg-indigo-100 text-indigo-800" },
  arrived: { label: "Arrived", className: "bg-purple-100 text-purple-800" },
  cash_collection_pending: { label: "Collect COD", className: "bg-red-100 text-red-800" },
  cash_collected: { label: "COD collected", className: "bg-emerald-100 text-emerald-800" },
  delivered: { label: "Delivered", className: "bg-gray-100 text-gray-800" },
  cash_handover_pending: { label: "Handover pending", className: "bg-amber-100 text-amber-800" },
  cash_handed_to_manager: { label: "Handed to manager", className: "bg-teal-100 text-teal-800" },
  cash_reconciled: { label: "Reconciled", className: "bg-emerald-100 text-emerald-800" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800" },
};

function CashCollectModal({
  stop,
  open,
  onClose,
  onConfirm,
  busy,
}: {
  stop: InHouseCodStop;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  const expected = stop.codExpectedAmount ?? stop.grandTotal;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Collect cash — {stop.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>Expected amount: <strong>₹{expected}</strong></p>
          <p>Did you collect ₹{expected} in cash?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button disabled={busy} onClick={onConfirm}>Confirm cash collected</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeliverModal({
  stop,
  open,
  onClose,
  onConfirm,
  busy,
}: {
  stop: InHouseCodStop;
  open: boolean;
  onClose: () => void;
  onConfirm: (collectedAmount?: number, note?: string) => void;
  busy: boolean;
}) {
  const expected = stop.codExpectedAmount ?? stop.grandTotal;
  const [collected, setCollected] = React.useState(String(expected));
  const [note, setNote] = React.useState("");
  const mismatch = stop.isCod && Number(collected) !== expected;

  React.useEffect(() => {
    if (open) {
      setCollected(String(expected));
      setNote("");
    }
  }, [open, expected]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Mark delivered — {stop.orderNumber}</DialogTitle>
        </DialogHeader>
        {stop.isCod ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="text-gray-500">Expected COD</p>
              <p className="text-xl font-bold">₹{expected}</p>
            </div>
            <div>
              <Label htmlFor="collected">Collected amount</Label>
              <Input
                id="collected"
                type="number"
                value={collected}
                onChange={(e) => setCollected(e.target.value)}
              />
            </div>
            {mismatch && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Amount does not match expected. Manager review may be required.
              </div>
            )}
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Confirm delivery to customer?</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={busy || (stop.isCod && !collected)}
            onClick={() =>
              onConfirm(stop.isCod ? Number(collected) : undefined, note || undefined)
            }
          >
            Confirm delivered
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const LIVE_TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Active" },
  { id: "completed", label: "Past Orders" },
  { id: "failed", label: "Failed" },
];

export function RealtimeDriverStops({ date }: { date?: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = React.useState<Tab>("today");
  const [deliverStop, setDeliverStop] = React.useState<InHouseCodStop | null>(null);
  const [qrStop, setQrStop] = React.useState<InHouseCodStop | null>(null);
  const [cashStop, setCashStop] = React.useState<InHouseCodStop | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["realtime-driver", tab, date],
    queryFn: () => inHouseRiderApi.myDeliveries({ tab, date }),
    refetchInterval: tab === "today" ? 30000 : false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["realtime-driver"] });

  const pickedUpMutation = useMutation({
    mutationFn: (id: string) => inHouseRiderApi.pickedUp(id),
    onSuccess: () => { invalidate(); toast.success("Marked picked up"); },
    onError: (err: Error) => toast.error(err?.message || "Update failed"),
  });

  const arrivedMutation = useMutation({
    mutationFn: (id: string) => inHouseRiderApi.arrived(id),
    onSuccess: () => { invalidate(); toast.success("Marked arrived"); },
    onError: (err: Error) => toast.error(err?.message || "Update failed"),
  });

  const deliveredMutation = useMutation({
    mutationFn: ({ id, collectedAmount, note }: { id: string; collectedAmount?: number; note?: string }) =>
      inHouseRiderApi.delivered(id, { collectedAmount, note }),
    onSuccess: () => {
      invalidate();
      setDeliverStop(null);
      toast.success("Marked delivered");
    },
    onError: (err: Error) => toast.error(err?.message || "Delivery failed"),
  });

  const failedMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      inHouseRiderApi.failed(id, { failureReason: reason }),
    onSuccess: () => { invalidate(); toast.success("Marked failed"); },
    onError: (err: Error) => toast.error(err?.message || "Update failed"),
  });

  const cashMutation = useMutation({
    mutationFn: (stop: InHouseCodStop) =>
      inHouseRiderApi.confirmCodCash(stop.orderId, {
        collectedAmount: stop.codExpectedAmount ?? stop.grandTotal,
      }),
    onSuccess: () => {
      invalidate();
      setCashStop(null);
      toast.success("Cash collection confirmed");
    },
    onError: (err: Error) => toast.error(err?.message || "Cash confirmation failed"),
  });

  const stops = (data?.stops ?? []).filter((stop) =>
    tab === "today" ? TODAY_VISIBLE_WORKFLOWS.has(stop.riderWorkflowStatus) : true,
  );
  const busy =
    pickedUpMutation.isPending ||
    arrivedMutation.isPending ||
    deliveredMutation.isPending ||
    failedMutation.isPending ||
    cashMutation.isPending;

  const emptyMessage =
    tab === "today"
      ? "No active realtime orders for this date."
      : tab === "completed"
        ? "No completed orders for this date."
        : "No failed orders for this date.";

  return (
    <section className="mb-6 space-y-3">
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {LIVE_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "whitespace-nowrap px-3 py-2 text-xs font-medium",
              tab === item.id ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-orange-700">
          Realtime orders ({stops.length})
        </h3>
        {tab === "today" && data?.counts.codPending ? (
          <Badge variant="destructive" className="gap-1">
            <IndianRupee className="h-3 w-3" />
            {data.counts.codPending} COD pending
          </Badge>
        ) : null}
      </div>

      {isLoading && stops.length === 0 ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : stops.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
          {emptyMessage}
        </p>
      ) : null}

      {stops.length === 0 ? null : (
        <>

      {stops.map((stop) => {
        const ws = WORKFLOW_LABELS[stop.riderWorkflowStatus] ?? WORKFLOW_LABELS.assigned;
        const isCodHighlight =
          stop.isCod && !isCodCollected(stop.codCollectionStatus) && stop.requiresCodCollection;

        return (
          <article
            key={stop.id}
            className={cn(
              "rounded-2xl border bg-white p-4 shadow-sm",
              isCodHighlight ? "border-red-300 ring-1 ring-red-200" : "border-orange-200",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{stop.orderNumber}</p>
                <p className="text-sm text-gray-600">{stop.customerName}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", ws.className)}>
                  {ws.label}
                </span>
                {stop.isCod && (
                  <Badge
                    variant={isCodCollected(stop.codCollectionStatus) ? "default" : "destructive"}
                    className={cn(
                      "gap-1",
                      isCodCollected(stop.codCollectionStatus) && "bg-emerald-600 hover:bg-emerald-600",
                    )}
                  >
                    <IndianRupee className="h-3 w-3" />
                    {stop.codCollectedAmount ?? stop.codExpectedAmount ?? stop.grandTotal}
                    {isCodCollected(stop.codCollectionStatus) ? " · Collected" : " · Collect"}
                  </Badge>
                )}
              </div>
            </div>

            <p className="mt-2 flex items-start gap-1 text-sm text-gray-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {stop.navigationTarget === "branch" ? (
                <span>
                  <span className="font-medium text-orange-700">Pickup at branch: </span>
                  {stop.branchName ?? stop.address}
                </span>
              ) : (
                stop.address
              )}
            </p>

            {(stop.riderWorkflowStatus === "cash_handover_pending" ||
              stop.riderWorkflowStatus === "cash_handed_to_manager") && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {stop.riderWorkflowStatus === "cash_handover_pending"
                  ? `Delivery complete. Hand ₹${stop.codCollectedAmount ?? stop.codExpectedAmount ?? stop.grandTotal} cash to your manager for end-of-day reconciliation.`
                  : "Cash recorded by manager — waiting for final confirmation in COD Reconciliation. No action needed from you."}
              </p>
            )}

            {stop.riderWorkflowStatus === "cash_reconciled" && (
              <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                COD reconciled with manager — no further action needed.
              </p>
            )}

            {stop.riderWorkflowStatus === "cash_collected" && (
              <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                COD collected — tap <strong>Delivered</strong> to complete this order.
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {stop.customerPhone && (tab === "today" || tab === "failed") && stop.riderWorkflowStatus !== "cash_collected" && (
                <Button size="sm" variant="outline" href={`tel:${stop.customerPhone}`}>
                  <Phone className="mr-1 h-4 w-4" />
                  Call
                </Button>
              )}
              {stop.googleMapsUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  href={stop.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="mr-1 h-4 w-4" />
                  {stop.navigationTarget === "branch" ? "Branch" : "Customer"}
                </Button>
              )}

              {tab === "today" && stop.riderWorkflowStatus === "assigned" && (
                <Button size="sm" disabled={busy} onClick={() => pickedUpMutation.mutate(stop.id)}>
                  Picked up
                </Button>
              )}

              {tab === "today" && stop.riderWorkflowStatus === "picked_up" && (
                <Button size="sm" disabled={busy} onClick={() => arrivedMutation.mutate(stop.id)}>
                  Arrived
                </Button>
              )}

              {tab === "today" &&
                stop.isCod &&
                stop.requiresCodCollection &&
                (stop.riderWorkflowStatus === "arrived" ||
                  stop.riderWorkflowStatus === "cash_collection_pending") && (
                  <>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => setQrStop(stop)}>
                      Show QR
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => setCashStop(stop)}>
                      Collect Cash
                    </Button>
                  </>
                )}

              {tab === "today" && stop.canMarkDelivered && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={busy}
                  onClick={() => setDeliverStop(stop)}
                >
                  Delivered
                </Button>
              )}

              {tab === "today" && stop.canMarkFailed && (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => {
                    const reason = window.prompt("Failure reason?") ?? "Could not deliver";
                    failedMutation.mutate({ id: stop.id, reason });
                  }}
                >
                  Failed
                </Button>
              )}
            </div>
          </article>
        );
      })}

      {deliverStop && (
        <DeliverModal
          stop={deliverStop}
          open={!!deliverStop}
          onClose={() => setDeliverStop(null)}
          busy={deliveredMutation.isPending}
          onConfirm={(collectedAmount, note) =>
            deliveredMutation.mutate({ id: deliverStop.id, collectedAmount, note })
          }
        />
      )}

      {qrStop && (
        <CodQrModal
          stop={qrStop}
          open={!!qrStop}
          onClose={() => setQrStop(null)}
          onPaid={() => {
            invalidate();
            setQrStop(null);
          }}
        />
      )}

      {cashStop && (
        <CashCollectModal
          stop={cashStop}
          open={!!cashStop}
          onClose={() => setCashStop(null)}
          busy={cashMutation.isPending}
          onConfirm={() => cashMutation.mutate(cashStop)}
        />
      )}
        </>
      )}
    </section>
  );
}
