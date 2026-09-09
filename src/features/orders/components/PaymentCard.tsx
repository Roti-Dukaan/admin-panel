import type { PaymentInfo } from "../types/order"
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_CONFIG } from "../types/order"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Clock,
  Smartphone,
  Banknote,
  Building2,
  Hash,
  ArrowDown,
  User,
  Truck,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const paymentStatusIcons = {
  pending: AlertCircle,
  paid: CheckCircle2,
  failed: XCircle,
  refunded: RotateCcw,
  cod_pending: Clock,
  cod_collected: CheckCircle2,
}

interface PaymentCardProps {
  payment: PaymentInfo | undefined
}

export function PaymentCard({ payment }: PaymentCardProps) {
  if (!payment) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Payment information not available</p>
        </div>
      </div>
    )
  }

  const StatusIcon = paymentStatusIcons[payment.status]
  const statusConfig = PAYMENT_STATUS_CONFIG[payment.status]
  const isCod = payment.method === "cod"
  const isOnline = payment.method === "online"

  return (
    <div className="space-y-4">
      {/* Payment Information Card */}
      <div className="rounded-xl border border-border p-4 space-y-4">
        <h4 className="text-sm font-semibold">Payment Information</h4>

        {/* Method + Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <Smartphone className="h-4 w-4 text-emerald-600" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                <Banknote className="h-4 w-4 text-orange-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{PAYMENT_METHOD_LABELS[payment.method]}</p>
              <p className="text-xs text-muted-foreground">
                {isOnline ? "Razorpay Gateway" : "Collect at doorstep"}
              </p>
            </div>
          </div>
          <Badge variant={statusConfig?.textClass?.includes("emerald") ? "success" : statusConfig?.textClass?.includes("red") ? "destructive" : statusConfig?.textClass?.includes("amber") || statusConfig?.textClass?.includes("orange") ? "warning" : "info"}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {PAYMENT_STATUS_LABELS[payment.status]}
          </Badge>
        </div>

        {/* Transaction Details */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-3">
          {payment.transactionId && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                Transaction ID
              </span>
              <span className={payment.transactionId === "Collected Cash" ? "text-xs font-medium" : "font-mono text-xs"}>
                {payment.transactionId}
              </span>
            </div>
          )}
          {payment.gateway && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                Gateway
              </span>
              <span className="text-xs font-medium capitalize">{payment.gateway}</span>
            </div>
          )}
          {payment.paymentDateTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Payment Date & Time
              </span>
              <span className="text-xs">{formatDateTime(payment.paymentDateTime)}</span>
            </div>
          )}
          {payment.referenceNumber && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5" />
                Reference Number
              </span>
              <span className="font-mono text-xs">{payment.referenceNumber}</span>
            </div>
          )}
        </div>

        {/* COD Specific Info */}
        {isCod && payment.cod && (
          <div className="space-y-2 rounded-lg bg-orange-50/50 border border-orange-100 p-3">
            <p className="text-xs font-semibold text-orange-800 mb-2">Cash on Delivery</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Collection Status</span>
              <Badge variant={payment.cod.collectionStatus === "collected" ? "success" : payment.cod.collectionStatus === "failed_collection" ? "destructive" : "warning"}>
                {payment.cod.collectionStatus === "collected" ? "Collected" : payment.cod.collectionStatus === "failed_collection" ? "Failed" : "Pending"}
              </Badge>
            </div>
            {payment.cod.collectionTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Collection Time</span>
                <span className="text-xs">{formatDateTime(payment.cod.collectionTime)}</span>
              </div>
            )}
            {payment.cod.collectedBy && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Collected By
                </span>
                <span className="text-xs">{payment.cod.collectedBy}</span>
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="space-y-1.5 border-t border-border pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(payment.subtotal)}</span>
          </div>
          {payment.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-emerald-600">-{formatCurrency(payment.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span>{formatCurrency(payment.deliveryCharges)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST (5%)</span>
            <span>{formatCurrency(payment.taxes)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-1.5">
            <span>Grand Total</span>
            <span className="text-primary">{formatCurrency(payment.grandTotal)}</span>
          </div>
        </div>

        {/* Payment Method & Status Summary */}
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div className="rounded-lg bg-muted p-2">
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <p className="text-sm font-semibold">{PAYMENT_METHOD_LABELS[payment.method]}</p>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <p className="text-xs text-muted-foreground">Payment Status</p>
            <p className="text-sm font-semibold">{PAYMENT_STATUS_LABELS[payment.status]}</p>
          </div>
        </div>
      </div>

      {/* Payment Timeline */}
      {payment.paymentTimeline && (
        <div className="rounded-xl border border-border p-4 space-y-3">
          <h4 className="text-sm font-semibold">Payment Timeline</h4>
          <div className="relative space-y-3">
            {payment.paymentTimeline.initiated && (
              <TimelineStep
                label="Payment Initiated"
                timestamp={payment.paymentTimeline.initiated}
                status="completed"
                isLast={!payment.paymentTimeline.authorized && !payment.paymentTimeline.successful && !payment.paymentTimeline.failed}
              />
            )}
            {payment.paymentTimeline.authorized && (
              <TimelineStep
                label="Payment Authorized"
                timestamp={payment.paymentTimeline.authorized}
                status="completed"
                isLast={!payment.paymentTimeline.successful && !payment.paymentTimeline.failed}
              />
            )}
            {payment.paymentTimeline.successful && (
              <TimelineStep
                label="Payment Successful"
                timestamp={payment.paymentTimeline.successful}
                status="completed"
                isLast={!payment.cod}
              />
            )}
            {payment.paymentTimeline.failed && (
              <TimelineStep
                label="Payment Failed"
                timestamp={payment.paymentTimeline.failed}
                status="failed"
                isLast={true}
              />
            )}
            {isCod && payment.cod && (
              <>
                <TimelineStep
                  label="COD Pending"
                  timestamp={payment.paymentTimeline.initiated || ""}
                  status={payment.cod.collectionStatus === "collected" ? "completed" : "current"}
                  isLast={payment.cod.collectionStatus === "pending"}
                />
                {payment.cod.collectionStatus === "collected" && payment.cod.collectionTime && (
                  <TimelineStep
                    label="COD Collected"
                    timestamp={payment.cod.collectionTime}
                    status="completed"
                    isLast={true}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineStep({
  label,
  timestamp,
  status,
  isLast,
}: {
  label: string
  timestamp: string
  status: "completed" | "failed" | "current"
  isLast: boolean
}) {
  return (
    <div className="relative flex gap-3">
      {!isLast && (
        <div
          className={cn(
            "absolute left-[11px] top-6 h-full w-[2px]",
            status === "completed" ? "bg-emerald-500" : status === "failed" ? "bg-red-500" : "bg-border"
          )}
        />
      )}
      <div className="relative z-10">
        {status === "completed" ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        ) : status === "failed" ? (
          <XCircle className="h-6 w-6 text-red-500" />
        ) : (
          <Clock className="h-6 w-6 text-primary animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          status === "completed" ? "text-foreground" : status === "failed" ? "text-red-600" : "text-muted-foreground"
        )}>
          {label}
        </p>
        {timestamp && (
          <p className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  )
}
