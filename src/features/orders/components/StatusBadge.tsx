import { cn } from "@/lib/utils"
import type { OrderStatus } from "../types/order"
import { STATUS_CONFIG } from "../types/order"

interface StatusBadgeProps {
  status: string
  className?: string
}

// Normalize backend status (uppercase) to frontend format
function normalizeStatus(status: string): OrderStatus {
  return (status.toLowerCase().replace(/_/g, '-') as OrderStatus) || 'pending';
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status)
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
