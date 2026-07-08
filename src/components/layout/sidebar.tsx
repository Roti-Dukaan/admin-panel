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
  HelpCircle,
  ClipboardList,
  CreditCard,
  Clock,
  Shield,
  BarChart3,
  Wallet,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag, badge: "3" },
  { label: "Kitchen", href: "/kitchen", icon: UtensilsCrossed },
  { label: "Menu Items", href: "/menu", icon: ClipboardList },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Subscription Plans", href: "/subscription-plans", icon: CreditCard },
  { label: "Delivery Slots", href: "/delivery-slots", icon: Clock },
  { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { label: "Payments", href: "/admin/payments", icon: Wallet },
  { label: "Roles & Permissions", href: "/admin/roles", icon: Shield },
]

const bottomItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help & Support", href: "/help", icon: HelpCircle },
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
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-gray-200/80 bg-white transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-gray-100 px-5", collapsed && "justify-center px-0")}>
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-500/20">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-gray-900 leading-tight">Roti Dukaan</span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Admin</span>
            </div>
          </Link>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-500/20">
            <Store className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className={cn("mb-3", collapsed && "hidden")}>
          <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Main Menu
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-orange-50 text-orange-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="h-3 w-3 text-gray-500" /> : <ChevronLeft className="h-3 w-3 text-gray-500" />}
        </button>
      )}
    </aside>
  )
}
