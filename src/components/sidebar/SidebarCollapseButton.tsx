"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarCollapseButtonProps {
  collapsed: boolean
  onToggle: () => void
}

export function SidebarCollapseButton({ collapsed, onToggle }: SidebarCollapseButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center",
        "rounded-full border border-gray-200 bg-white shadow-sm",
        "hover:bg-gray-50 hover:shadow-md transition-all duration-200"
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? (
        <ChevronRight className="h-3 w-3 text-gray-500" />
      ) : (
        <ChevronLeft className="h-3 w-3 text-gray-500" />
      )}
    </button>
  )
}
