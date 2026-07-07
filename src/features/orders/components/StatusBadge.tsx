import { cn } from "@/lib/utils"
import type { OrderStatus } from "../types/order"
import { STATUS_CONFIG } from "../types/order"

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      {config.label}
    </span>
  )
}
