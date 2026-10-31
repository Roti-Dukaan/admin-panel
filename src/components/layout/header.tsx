"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Bell, Search, Menu } from "lucide-react"
import { useSidebarMobile } from "./sidebar-provider"
import { RotiDukaanLogoMark } from "@/components/brand/RotiDukaanLogo"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { getPortalHomeHref } from "@/lib/brand/portal-home"

interface HeaderProps {
  title?: string
  subtitle?: string
  titleNode?: React.ReactNode
  dateFilter?: React.ReactNode
  actions?: React.ReactNode
  showSearch?: boolean
  className?: string
}

export function Header({ title, subtitle, titleNode, dateFilter, actions, showSearch = true, className }: HeaderProps) {
  const [searchFocused, setSearchFocused] = React.useState(false)
  const { setMobileOpen } = useSidebarMobile()
  const { isBranchManager, isDeliveryBoy } = useWorkspace()
  const homeHref = getPortalHomeHref({ isBranchManager, isDeliveryBoy })

  return (
    <header className={cn("sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl px-6", className)}>
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href={homeHref}
          className="shrink-0 rounded-full ring-2 ring-orange-500/15 transition hover:ring-orange-500/35 lg:hidden"
          aria-label="Roti Dukaan home"
        >
          <RotiDukaanLogoMark size="xs" shape="circle" />
        </Link>
        {titleNode ? (
          <div className="min-w-0">{titleNode}</div>
        ) : (
          title && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="truncate text-sm text-gray-500">{subtitle}</p>}
            </div>
          )
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {dateFilter}
        {actions}

        {/* Search */}
        {showSearch && (
          <div className={cn("relative transition-all duration-200", searchFocused ? "w-56" : "w-40")}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
        )}

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
        </button>


      </div>
    </header>
  )
}
