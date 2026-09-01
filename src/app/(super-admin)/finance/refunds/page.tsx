"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { refundsApi, type RefundRecord } from "@/lib/api/refunds.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RefundsPage() {
  const [items, setItems] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await refundsApi.list({ limit: 50 });
      setItems(data.items ?? []);
    } catch (error) {
      console.error("Failed to load refunds", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <Header title="Refunds" />
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Finance → Refunds</CardTitle>
            <Button variant="outline" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading refunds…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No refunds yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 pr-3">Refund ID</th>
                      <th className="py-2 pr-3">Order</th>
                      <th className="py-2 pr-3">Customer</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((refund) => (
                      <tr key={refund.id} className="border-b align-top">
                        <td className="py-3 pr-3 font-medium">{refund.refundNo}</td>
                        <td className="py-3 pr-3">{refund.orderNo ?? "—"}</td>
                        <td className="py-3 pr-3">{refund.customerName ?? refund.customerId}</td>
                        <td className="py-3 pr-3">{refund.refundType.replaceAll("_", " ")}</td>
                        <td className="py-3 pr-3">₹{refund.refundedAmount ?? refund.requestedAmount}</td>
                        <td className="py-3 pr-3">
                          <Badge variant="outline">{refund.status}</Badge>
                        </td>
                        <td className="py-3 pr-3">{new Date(refund.requestedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
