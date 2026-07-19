"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
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
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
        "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
        collapsed && "justify-center px-2"
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-[18px] w-[18px] shrink-0 transition-colors" />
      ) : (
        <>
          <PanelLeftClose className="h-[18px] w-[18px] shrink-0 transition-colors" />
          <span className="flex-1 text-left">Collapse</span>
        </>
      )}
    </button>
  )
}
