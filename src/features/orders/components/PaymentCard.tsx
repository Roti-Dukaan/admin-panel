import type { PaymentInfo } from "../types/order"
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "../types/order"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle2, XCircle, AlertCircle, RotateCcw } from "lucide-react"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const paymentStatusConfig = {
  pending: { icon: AlertCircle, variant: "warning" as const },
  paid: { icon: CheckCircle2, variant: "success" as const },
  failed: { icon: XCircle, variant: "destructive" as const },
  refunded: { icon: RotateCcw, variant: "info" as const },
}

interface PaymentCardProps {
  payment: PaymentInfo
}

export function PaymentCard({ payment }: PaymentCardProps) {
  const statusConfig = paymentStatusConfig[payment.status]
  const StatusIcon = statusConfig.icon

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h4 className="text-sm font-semibold">Payment</h4>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{PAYMENT_METHOD_LABELS[payment.method]}</span>
        </div>
        <Badge variant={statusConfig.variant}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {PAYMENT_STATUS_LABELS[payment.status]}
        </Badge>
      </div>

      {payment.transactionId && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Transaction ID:</span> {payment.transactionId}
        </div>
      )}

      <div className="space-y-1.5 border-t border-border pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(payment.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxes</span>
          <span>{formatCurrency(payment.taxes)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery</span>
          <span>{formatCurrency(payment.deliveryCharges)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold border-t border-border pt-1.5">
          <span>Grand Total</span>
          <span className="text-primary">{formatCurrency(payment.grandTotal)}</span>
        </div>
      </div>
    </div>
  )
}
