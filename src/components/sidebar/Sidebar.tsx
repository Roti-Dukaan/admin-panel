"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  ClipboardList,
  Clock3,
  UtensilsCrossed,
  Truck,
  Users,
  CalendarDays,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Settings,
  FileClock,
  Activity,
  Building2,
  MapPin,
  Store,
  ToggleLeft,
  Package,
} from "lucide-react"
import { useSidebar } from "./hooks/useSidebar"
import { SidebarGroup } from "./SidebarGroup"
import { SidebarItem } from "./SidebarItem"
import { SidebarFooter } from "./SidebarFooter"
import { SidebarCollapseButton } from "./SidebarCollapseButton"
import type { NavGroup } from "./types"
import { useOrdersStore } from "@/features/orders/hooks/useOrders"


const navGroups: NavGroup[] = [
  {
    id: "overview",
    title: "Overview",
    roles: ['OWNER', 'ADMIN', 'BRANCH_MANAGER'],
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ['OWNER', 'ADMIN', 'BRANCH_MANAGER'] },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    roles: ['OWNER', 'ADMIN', 'BRANCH_MANAGER'],
    items: [
      { label: "Orders", href: "/orders", icon: ShoppingBag, roles: ['OWNER', 'ADMIN', 'BRANCH_MANAGER'] },
      { label: "Kitchen", href: "/kitchen", icon: ChefHat, roles: ['OWNER', 'ADMIN', 'BRANCH_MANAGER'] },
      { label: "Kitchen Production", href: "/kitchen-production", icon: ClipboardList, roles: ['OWNER', 'ADMIN'] },
      { label: "Deliveries", href: "/deliveries", icon: Truck, roles: ['OWNER', 'ADMIN', 'BRANCH_MANAGER'] },
      { label: "Delivery Slots", href: "/delivery-slots", icon: Clock3, roles: ['OWNER', 'ADMIN'] },
      { label: "Inventory & Availability", href: "/branch-inventory", icon: Package, roles: ['BRANCH_MANAGER'] },
    ],
  },
  {
    id: "menu",
    title: "Menu Management",
    roles: ['OWNER', 'ADMIN', 'BRANCH_MANAGER'],
    items: [
      { label: "Menu Items", href: "/menu", icon: UtensilsCrossed, roles: ['OWNER', 'ADMIN'] },
      { label: "Availability Overview", href: "/admin/branch-menu-availability", icon: ToggleLeft, roles: ['OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    roles: ['OWNER', 'ADMIN'],
    items: [
      { label: "Customers", href: "/customers", icon: Users, roles: ['OWNER', 'ADMIN'] },
      { label: "Subscription Plans", href: "/subscription-plans", icon: CalendarDays, roles: ['OWNER', 'ADMIN'] },
      { label: "Subscriptions", href: "/subscriptions", icon: CreditCard, roles: ['OWNER', 'ADMIN'] },
      { label: "Subscription Ops", href: "/subscription-operations", icon: Activity, roles: ['OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "master-data",
    title: "Master Data",
    roles: ['OWNER', 'ADMIN'],
    items: [
      { label: "Cities", href: "/cities", icon: Building2, roles: ['OWNER', 'ADMIN'] },
      { label: "Areas", href: "/areas", icon: MapPin, roles: ['OWNER', 'ADMIN'] },
      { label: "Branches", href: "/branches", icon: Store, roles: ['OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    roles: ['OWNER', 'ADMIN'],
    items: [
      { label: "Payments", href: "/admin/payments", icon: CreditCard, roles: ['OWNER', 'ADMIN'] },
      { label: "Reports & Analytics", href: "/reports", icon: BarChart3, roles: ['OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "system",
    title: "System",
    roles: ['OWNER', 'ADMIN'],
    items: [
      { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck, roles: ['OWNER', 'ADMIN'] },
      { label: "Settings", href: "/settings", icon: Settings, roles: ['OWNER', 'ADMIN'] },
      { label: "Audit Logs", href: "/audit-logs", icon: FileClock, roles: ['OWNER', 'ADMIN'] },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ collapsed = false, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const { isGroupExpanded, toggleGroup } = useSidebar()
  const statistics = useOrdersStore((s) => s.statistics)
  const kitchenLiveOrders = (statistics?.preparing ?? 0) + (statistics?.packed ?? 0)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-gray-100 px-5", collapsed && "justify-center px-0")}>
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all">
              <img src="/roti_dukaan_logo.jpg" alt="Roti Dukaan" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-gray-900 leading-tight">Roti Dukaan</span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Admin</span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-500/20 hover:ring-orange-500/40 transition-all">
            <img src="/roti_dukaan_logo.jpg" alt="Roti Dukaan" className="h-full w-full object-cover" />
          </Link>
        )}
      </div>

      {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1 scrollbar-thin" role="navigation" aria-label="Sidebar navigation">
        {navGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            id={group.id}
            title={group.title}
            collapsed={collapsed}
            isExpanded={isGroupExpanded(group.id)}
            onToggle={toggleGroup}
          >
            {group.items.map((item) => (
              <SidebarItem
                key={item.href}
                label={item.label}
                href={item.href}
                icon={item.icon}
                badge={item.href === "/kitchen" ? kitchenLiveOrders : undefined}
                collapsed={collapsed}
                disabled={item.disabled}
              />
            ))}
          </SidebarGroup>
        ))}
      </nav>

      {/* Bottom section: Collapse toggle + Footer */}
      <div className="mt-auto border-t border-gray-100">
        {onToggle && (
          <div className="px-3 pt-3 pb-1">
            <SidebarCollapseButton collapsed={collapsed} onToggle={onToggle} />
          </div>
        )}
        <div className="px-3 pb-3">
          <SidebarFooter collapsed={collapsed} />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-gray-200/80 bg-white transition-all duration-300",
          "hidden lg:flex",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside
            className={cn(
              "fixed left-0 top-0 z-50 h-screen w-[280px] flex flex-col border-r border-gray-200/80 bg-white",
              "lg:hidden"
            )}
            role="dialog"
            aria-label="Mobile sidebar"
          >
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onMobileClose}>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-500/20">
                  <img src="/roti_dukaan_logo.jpg" alt="Roti Dukaan" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-gray-900 leading-tight">Roti Dukaan</span>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Admin</span>
                </div>
              </Link>
              <button
                onClick={onMobileClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close sidebar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1 scrollbar-thin" role="navigation" aria-label="Sidebar navigation">
        {navGroups.map((group) => (
                <SidebarGroup
                  key={group.id}
                  id={group.id}
                  title={group.title}
                  collapsed={false}
                  isExpanded={isGroupExpanded(group.id)}
                  onToggle={toggleGroup}
                >
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.href}
                      label={item.label}
                      href={item.href}
                      icon={item.icon}
                      badge={item.href === "/kitchen" ? kitchenLiveOrders : undefined}
                      collapsed={false}
                      disabled={item.disabled}
                    />
                  ))}
                </SidebarGroup>
              ))}
            </nav>

            <div className="border-t border-gray-100 px-3 py-3">
              <SidebarFooter collapsed={false} />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
