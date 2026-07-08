"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SidebarBadge } from "./SidebarBadge"

export interface SidebarItemProps {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  badgeVariant?: "default" | "warning" | "danger"
  collapsed?: boolean
  disabled?: boolean
  tooltip?: string
}

export function SidebarItem({
  label,
  href,
  icon: Icon,
  badge,
  badgeVariant = "default",
  collapsed = false,
  disabled = false,
  tooltip,
}: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + "/")

  if (disabled) {
    return (
      <div
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
          "cursor-not-allowed text-gray-300 opacity-50",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? tooltip || label : tooltip}
      >
        <Icon className="h-[18px] w-[18px] shrink-0 text-gray-300" />
        {!collapsed && (
          <>
            <span className="flex-1">{label}</span>
            <span className="text-[10px] font-medium text-gray-300">Soon</span>
          </>
        )}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
        isActive
          ? "bg-orange-50 text-orange-600 shadow-sm"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? tooltip || label : tooltip}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && <SidebarBadge count={badge} variant={badgeVariant} />}
        </>
      )}
    </Link>
  )
}
