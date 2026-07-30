import { cn } from "@/lib/utils"
import type { OrderTimelineEntry, OrderStatus } from "../types/order"
import { CheckCircle2, Clock, Circle } from "lucide-react"
import { normalizeOrderStatus } from "../utils/status"

const STATUS_ORDER: OrderStatus[] = [
  "pending-confirmation",
  "confirmed",
  "accepted",
  "preparing",
  "ready-for-pickup",
  "picked-up",
  "out-for-delivery",
  "delivered",
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  "pending-confirmation": "Order Placed",
  confirmed: "Confirmed",
  pending: "Order Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  packed: "Packed",
  "ready-for-pickup": "Ready for Pickup",
  "picked-up": "Picked Up",
  "out-for-delivery": "Out For Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
  refunded: "Refunded",
}

interface OrderTimelineProps {
  timeline: OrderTimelineEntry[]
  currentStatus: OrderStatus
}

export function OrderTimeline({ timeline, currentStatus }: OrderTimelineProps) {
  const normalizedCurrent = normalizeOrderStatus(currentStatus)
  const isCancelled = normalizedCurrent === "cancelled"

  const activeStatuses: OrderStatus[] = isCancelled
    ? [...STATUS_ORDER.slice(0, 1), "cancelled"]
    : STATUS_ORDER

  const timelineMap = new Map(
    timeline.map((t) => [normalizeOrderStatus(String(t.status)), t.timestamp]),
  )

  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold mb-3">Order Timeline</h4>
      <div className="relative">
        {activeStatuses.map((status, index) => {
          const timestamp = timelineMap.get(status)
          const isCompleted = timestamp !== undefined
          const isCurrent = status === normalizedCurrent
          const isLast = index === activeStatuses.length - 1

          return (
            <div key={status} className="relative flex gap-3 pb-4">
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[11px] top-6 h-full w-[2px]",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <div className="relative z-10">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : isCurrent ? (
                  <Clock className="h-6 w-6 text-primary animate-pulse" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {STATUS_LABELS[status]}
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
        })}
      </div>
    </div>
  )
}
