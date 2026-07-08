"use client"

import { cn } from "@/lib/utils"

interface SidebarBadgeProps {
  count: number
  variant?: "default" | "warning" | "danger"
  className?: string
}

const variantStyles = {
  default: "bg-orange-500 text-white",
  warning: "bg-amber-500 text-white",
  danger: "bg-red-500 text-white",
}

export function SidebarBadge({ count, variant = "default", className }: SidebarBadgeProps) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
        variantStyles[variant],
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}
