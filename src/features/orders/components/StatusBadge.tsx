import { cn } from "@/lib/utils"
import type { OrderStatus } from "../types/order"
import { STATUS_CONFIG } from "../types/order"
import { normalizeOrderStatus } from "../utils/status"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = normalizeOrderStatus(status)
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending

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
