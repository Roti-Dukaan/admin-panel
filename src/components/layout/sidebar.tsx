"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag, badge: "New" },
  { label: "Menu Items", href: "/menu", icon: UtensilsCrossed },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center")}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Roti Dukaan</span>
          </Link>
        )}
        {collapsed && <Store className="h-6 w-6 text-primary" />}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-2">
        {!collapsed && (
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Log out</span>
          </button>
        )}
        {collapsed && (
          <button className="flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}
    </aside>
  )
}
