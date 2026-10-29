"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Truck } from "lucide-react";
import { supportApi } from "@/lib/api/support.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
};

const PAGE_SIZE = 5;

function statusBadgeClass(status: string): string {
  if (status === "DELIVERED") return "bg-green-100 text-green-700";
  if (status === "CANCELLED") return "bg-red-100 text-red-700";
  return "bg-blue-100 text-blue-700";
}

export function CustomerRecentOrdersCard({ customerId }: { customerId?: string }) {
  const [orders, setOrders] = useState<CustomerOrderRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [customerId]);

  useEffect(() => {
    if (!customerId) {
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
      return;
    }

    let cancelled = false;
    setLoading(true);
    supportApi
      .getCustomerOrders(customerId, page, PAGE_SIZE)
      .then(({ data }) => {
        if (cancelled) return;
        setOrders(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
      })
      .catch(() => {
        if (!cancelled) {
          setOrders([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerId, page]);

  if (!customerId) return null;

  const showPagination = totalPages > 1;

  return (
    <Card className="border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-700">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Recent Customer Orders
          </span>
          {total > 0 && (
            <span className="text-xs font-normal text-gray-400">{total} total</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">No orders found for this customer.</p>
        ) : (
          <>
            <div
              className="max-h-[220px] space-y-0 overflow-y-auto pr-1 scrollbar-thin"
              aria-label="Customer order history"
            >
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-gray-50 py-2.5 text-sm last:border-0"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-orange-600">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-gray-700">₹{order.grandTotal}</p>
                    <Badge className={`text-xs ${statusBadgeClass(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {showPagination && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
