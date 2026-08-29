"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { refundsApi, type RefundEligibility, type RefundRecord } from "@/lib/api/refunds.api";

const REASONS = [
  "MISSING_ITEM",
  "WRONG_ITEM",
  "FOOD_QUALITY_ISSUE",
  "LATE_DELIVERY",
  "DELIVERY_ISSUE",
  "ORDER_NOT_RECEIVED",
  "CUSTOMER_SERVICE_RECOVERY",
  "OTHER",
] as const;

export function SupportRefundPanel({
  ticketId,
  orderId,
  orderNumber,
  customerName,
}: {
  ticketId: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
}) {
  const [eligibility, setEligibility] = useState<RefundEligibility | null>(null);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [refundType, setRefundType] = useState<"PARTIAL_SUPPORT_REFUND" | "FULL_SUPPORT_REFUND">(
    "PARTIAL_SUPPORT_REFUND",
  );
  const [amount, setAmount] = useState("");
  const [reasonCategory, setReasonCategory] = useState<string>("MISSING_ITEM");
  const [reasonDetails, setReasonDetails] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!orderId) return;
    try {
      const [{ data: eligibilityData }, { data: refundData }] = await Promise.all([
        refundsApi.getEligibility(orderId),
        refundsApi.listForTicket(ticketId),
      ]);
      setEligibility(eligibilityData);
      setRefunds(refundData.items ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [ticketId, orderId]);

  if (!orderId) return null;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        orderId,
        refundType,
        reasonCategory,
        reasonDetails,
        customerVisibleNote: customerNote || undefined,
      };
      if (refundType === "PARTIAL_SUPPORT_REFUND") {
        body.requestedAmount = Number(amount);
      }
      await refundsApi.create(ticketId, body);
      setOpen(false);
      setAmount("");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create refund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">Refunds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {eligibility && (
          <div className="space-y-1 text-xs text-gray-600">
            <p>Order: {orderNumber ?? orderId}</p>
            <p>Customer: {customerName ?? "—"}</p>
            <p>Remaining refundable: ₹{eligibility.remainingRefundableAmount}</p>
          </div>
        )}
        {refunds.length > 0 && (
          <div className="space-y-2 border-t border-gray-100 pt-2">
            {refunds.map((refund) => (
              <div key={refund.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium">{refund.refundNo}</p>
                  <p className="text-gray-500">{refund.reasonCategory.replaceAll("_", " ")}</p>
                </div>
                <div className="text-right">
                  <p>₹{refund.refundedAmount ?? refund.requestedAmount}</p>
                  <p className="text-gray-500">{refund.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {!open ? (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)} disabled={!eligibility?.eligible}>
            Issue Refund
          </Button>
        ) : (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <label className="text-xs font-medium text-gray-500">Refund type</label>
            <select
              value={refundType}
              onChange={(e) => setRefundType(e.target.value as typeof refundType)}
              className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm"
            >
              <option value="PARTIAL_SUPPORT_REFUND">Partial Refund</option>
              <option value="FULL_SUPPORT_REFUND">Full Remaining Refund</option>
            </select>
            {refundType === "PARTIAL_SUPPORT_REFUND" && (
              <>
                <label className="text-xs font-medium text-gray-500">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm"
                />
              </>
            )}
            <label className="text-xs font-medium text-gray-500">Reason</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm"
            >
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="Reason details"
              className="min-h-[72px] w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Customer-visible note (optional)"
              className="min-h-[56px] w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={submit} disabled={submitting}>
                {submitting ? "Submitting…" : "Request Refund"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
