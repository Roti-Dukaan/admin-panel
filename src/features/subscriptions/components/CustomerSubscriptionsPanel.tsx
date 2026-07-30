"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subscriptionsApi } from "@/features/subscriptions/services/subscriptions.api";

type BackendSubscription = {
  id: string;
  status: string;
  autoRenew: boolean;
  pricePaid?: number | string | null;
  razorpaySubscriptionId?: string | null;
  razorpayPaymentId?: string | null;
  startDate: string;
  customer?: { id: string; name?: string | null; phone?: string | null };
  plan?: { id: string; name: string; type: string; price?: number | string };
};

function formatPrice(value: number | string | null | undefined) {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? "0"));
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

function paymentStatus(sub: BackendSubscription) {
  if (sub.razorpayPaymentId || sub.status === "ACTIVE") return "Paid";
  if (sub.status === "PENDING") return "Awaiting payment";
  if (sub.status === "CANCELLED") return "Cancelled";
  return sub.status;
}

export function CustomerSubscriptionsPanel() {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-customer-subscriptions"],
    queryFn: async () => {
      const res = await subscriptionsApi.list({ limit: "20", page: "1" });
      return (res?.data ?? []) as BackendSubscription[];
    },
    staleTime: 30_000,
  });

  const subs = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-teal-600" />
          Customer Subscriptions
        </CardTitle>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Recent subscriptions with Razorpay billing references.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading subscriptions…
          </div>
        ) : subs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No subscriptions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-4 font-semibold">Customer</th>
                  <th className="pb-2 pr-4 font-semibold">Plan</th>
                  <th className="pb-2 pr-4 font-semibold">Status</th>
                  <th className="pb-2 pr-4 font-semibold">Payment</th>
                  <th className="pb-2 pr-4 font-semibold">Razorpay Sub ID</th>
                  <th className="pb-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {subs.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">
                        {sub.customer?.name ?? "Customer"}
                      </p>
                      <p className="text-xs text-muted-foreground">{sub.customer?.phone ?? "—"}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{sub.plan?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(sub.plan?.price ?? sub.pricePaid)}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {sub.status}
                      </Badge>
                      {sub.autoRenew && (
                        <p className="mt-1 text-[10px] text-muted-foreground">Auto-renew</p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-medium">{paymentStatus(sub)}</span>
                      {sub.razorpayPaymentId && (
                        <p className="mt-0.5 max-w-[120px] truncate font-mono text-[10px] text-muted-foreground" title={sub.razorpayPaymentId}>
                          {sub.razorpayPaymentId}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {sub.razorpaySubscriptionId ? (
                        <code
                          className="block max-w-[140px] truncate rounded bg-muted px-2 py-1 text-[10px]"
                          title={sub.razorpaySubscriptionId}
                        >
                          {sub.razorpaySubscriptionId}
                        </code>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/subscriptions/subscriptions/${sub.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
