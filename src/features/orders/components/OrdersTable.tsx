"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "./StatusBadge"
import { useOrdersStore } from "../hooks/useOrders"
import type { Order, PaymentStatus, PaymentMethod } from "../types/order"
import { PAYMENT_STATUS_CONFIG, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_CONFIG } from "../types/order"
import { Eye, RefreshCw, ChevronLeft, ChevronRight, Smartphone, Banknote, CircleDollarSign } from "lucide-react"
import { DocumentsMenu } from "@/features/documents"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const config = PAYMENT_METHOD_CONFIG[method]
  if (!config) {
    return <span className="text-xs text-gray-500">{method}</span>
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", config.bgClass)}>
      {method === "online" ? (
        <Smartphone className="h-3 w-3" />
      ) : method === "cod" ? (
        <Banknote className="h-3 w-3" />
      ) : method === "subscription" ? (
        <CircleDollarSign className="h-3 w-3" />
      ) : null}
      {config.label}
    </span>
  )
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = PAYMENT_STATUS_CONFIG[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", config.bgClass, config.textClass)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  )
}

interface OrdersTableProps {
  onViewDetails: (order: Order) => void
}

export function OrdersTable({ onViewDetails }: OrdersTableProps) {
  const { orders, loading, pagination, setPage, setPageSize } = useOrdersStore()

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <RefreshCw className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No orders available.</h3>
          <p className="text-sm text-muted-foreground">
            Orders will appear here once customers start placing them.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Settlement Status</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.customer?.name ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{order.customer?.phone ?? '—'}</TableCell>
                <TableCell>{order.items.length} item(s)</TableCell>
                <TableCell className="font-medium">
                  {order.payment ? formatCurrency(order.payment.grandTotal) : "—"}
                </TableCell>
                <TableCell>
                  {order.payment ? (
                    <PaymentMethodBadge method={order.payment.method} />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {order.payment ? (
                    <PaymentStatusBadge status={order.payment.status} />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {order.payment?.method === "cod" && order.payment?.cod ? (
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", 
                      order.payment.cod.collectionStatus === "collected" ? "bg-green-100 text-green-800" :
                      order.payment.cod.collectionStatus === "failed_collection" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full",
                        order.payment.cod.collectionStatus === "collected" ? "bg-green-500" :
                        order.payment.cod.collectionStatus === "failed_collection" ? "bg-red-500" :
                        "bg-amber-500"
                      )} />
                      {order.payment.cod.collectionStatus === "collected" ? "Settled" :
                       order.payment.cod.collectionStatus === "failed_collection" ? "Failed" : "Pending"}
                    </span>
                  ) : order.payment?.method === "online" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Paid
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {order.payment?.transactionId ? (
                    order.payment.transactionId === "Collected Cash" ? (
                      <span className="text-xs text-muted-foreground">Collected Cash</span>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground" title={order.payment.transactionId}>
                        {order.payment.transactionId.length > 16
                          ? order.payment.transactionId.slice(0, 16) + "..."
                          : order.payment.transactionId}
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(order)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DocumentsMenu orderId={order.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>of {pagination.total} orders</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="px-3 text-sm">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
