"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  Clock3,
  UtensilsCrossed,
  Truck,
  Users,
  CalendarDays,
  CreditCard,
  BarChart3,
  UserPlus,
  Shield,
  Settings,
  FileClock,
  Building2,
  MapPin,
  Store,
  ToggleLeft,
  LifeBuoy,
  FolderOpen,
  Ticket,
  Mail,
  Bell,
  BellRing,
  LayoutGrid,
  Gift,
} from "lucide-react"
import { useSidebar } from "./hooks/useSidebar"
import { SidebarGroup } from "./SidebarGroup"
import { SidebarItem } from "./SidebarItem"
import { SidebarFooter } from "./SidebarFooter"
import { SidebarCollapseButton } from "./SidebarCollapseButton"
import type { NavGroup } from "./types"
import { useOrdersStore } from "@/features/orders/hooks/useOrders"
import { BRANCH_MANAGER_NAVIGATION, getNavigationForWorkspace } from "@/config/navigation"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { useBranchName } from "@/features/branch/hooks/useBranchName"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"


const MAIN_ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    title: "Overview",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'BRANCH_MANAGER'],
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'BRANCH_MANAGER'] },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'BRANCH_MANAGER'],
    items: [
      { label: "Orders", href: "/orders", icon: ShoppingBag, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'BRANCH_MANAGER'] },
      { label: "Deliveries", href: "/deliveries", icon: Truck, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'BRANCH_MANAGER'] },
      { label: "Delivery Slots", href: "/delivery-slots", icon: Clock3, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Customer Support", href: "/support", icon: LifeBuoy, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'BRANCH_MANAGER'] },
    ],
  },
  {
    id: "menu",
    title: "Menu Management",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'BRANCH_MANAGER'],
    items: [
      { label: "Menu Items", href: "/menu", icon: UtensilsCrossed, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Availability Overview", href: "/admin/branch-menu-availability", icon: ToggleLeft, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
    items: [
      { label: "Customers", href: "/customers", icon: Users, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Area Requests", href: "/customers/waitlist", icon: BellRing, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Subscription Plans", href: "/subscription-plans", icon: CalendarDays, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "master-data",
    title: "Master Data",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
    items: [
      { label: "Cities", href: "/cities", icon: Building2, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Areas", href: "/areas", icon: MapPin, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Branches", href: "/branches", icon: Store, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "growth",
    title: "Marketing / Growth",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
    items: [
      { label: "Campaigns", href: "/referrals/campaigns", icon: Gift, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Tracking", href: "/referrals/tracking", icon: UserPlus, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Fraud Review", href: "/referrals/fraud-review", icon: Shield, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Reports", href: "/referrals/reports", icon: BarChart3, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
    items: [
      { label: "Payments", href: "/admin/payments", icon: CreditCard, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Refunds", href: "/finance/refunds", icon: CreditCard, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'FINANCE'] },
      { label: "Coupons", href: "/coupons", icon: Ticket, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Reports & Analytics", href: "/reports", icon: BarChart3, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "system",
    title: "System",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
    items: [
      { label: "Team", href: "/admin/team", icon: UserPlus, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Notifications", href: "/admin/notifications", icon: Bell, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Roles & Permissions", href: "/admin/roles", icon: Shield, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Settings", href: "/settings", icon: Settings, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Audit Logs", href: "/audit-logs", icon: FileClock, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
    ],
  },
  {
    id: "cms",
    title: "CMS",
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
    items: [
      { label: "Website Banners", href: "/cms", icon: FolderOpen, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Mobile App CMS", href: "/mobile-app/home-page", icon: LayoutGrid, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
      { label: "Contact Messages", href: "/contact-messages", icon: Mail, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
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
  const pathname = usePathname()
  const { isGroupExpanded, toggleGroup } = useSidebar()
  const { isBranchManager, isDeliveryBoy } = useWorkspace()
  const branchName = useBranchName()
  const statistics = useOrdersStore((s) => s.statistics)
  const kitchenLiveOrders = (statistics?.preparing ?? 0) + (statistics?.packed ?? 0)
  const authRole = useAdminAuthStore((s) => s.role)
  const authRoles = useAdminAuthStore((s) => s.user?.roles ?? [])
  const userRoles = authRoles.length > 0 ? authRoles : authRole ? [authRole] : []

  const canSeeNavItem = (item: { roles?: string[] }) => {
    if (!item.roles?.length) return true
    return item.roles.some((r) => userRoles.includes(r))
  }

  const filterAdminNavGroups = (groups: NavGroup[]): NavGroup[] =>
    groups
      .filter((group) => !group.roles?.length || group.roles.some((r) => userRoles.includes(r)))
      .map((group) => ({
        ...group,
        items: group.items.filter(canSeeNavItem),
      }))
      .filter((group) => group.items.length > 0)

  const visibleNavGroups = isDeliveryBoy
    ? [{
      id: "delivery",
      title: "Delivery",
      items: getNavigationForWorkspace('DELIVERY_BOY').map((item) => ({
        label: item.label,
        href: item.href,
        icon: item.icon,
        disabled: false,
      })),
    }]
    : isBranchManager
    ? [{
      id: "branch",
      title: "Branch",
      items: BRANCH_MANAGER_NAVIGATION.map((item) => ({
        label: item.label,
        href: item.href,
        icon: item.icon,
        badge: item.href === "/branch/kitchen" ? kitchenLiveOrders : undefined,
        disabled: false,
      })),
    }]
    : filterAdminNavGroups(MAIN_ADMIN_NAV_GROUPS)

  const homeHref = isDeliveryBoy ? '/delivery' : isBranchManager ? '/branch/dashboard' : '/dashboard'
  const workspaceLabel = isDeliveryBoy ? 'Delivery' : isBranchManager ? 'Branch Manager' : 'Admin'
  const workspaceDetail = isBranchManager && branchName ? branchName : null

  const logoSubtitle = (
    <div className="flex min-w-0 flex-col">
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
        {workspaceLabel}
      </span>
      {workspaceDetail && (
        <span className="truncate text-[11px] font-semibold text-orange-600 normal-case tracking-normal">
          {workspaceDetail}
        </span>
      )}
    </div>
  )

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-gray-100 px-5", collapsed && "justify-center px-0")}>
        {!collapsed ? (
          <Link href={homeHref} className="flex items-center gap-2.5 group min-w-0" title={workspaceDetail ?? workspaceLabel}>
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all">
              <img src="/roti_dukaan_logo.png" alt="Roti Dukaan" className="h-full w-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-[15px] font-bold text-gray-900 leading-tight">Roti Dukaan</span>
              {logoSubtitle}
            </div>
          </Link>
        ) : (
          <Link href={homeHref} className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-500/20 hover:ring-orange-500/40 transition-all" title={workspaceDetail ?? workspaceLabel}>
            <img src="/roti_dukaan_logo.png" alt="Roti Dukaan" className="h-full w-full object-cover" />
          </Link>
        )}
      </div>

      {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1 scrollbar-thin" role="navigation" aria-label="Sidebar navigation">
        {visibleNavGroups.map((group) => (
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
                badge={'badge' in item ? item.badge : undefined}
                collapsed={collapsed}
                disabled={('disabled' in item) ? item.disabled : false}
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
              <Link href={homeHref} className="flex items-center gap-2.5 min-w-0" onClick={onMobileClose} title={workspaceDetail ?? workspaceLabel}>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-500/20">
                  <img src="/roti_dukaan_logo.png" alt="Roti Dukaan" className="h-full w-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-bold text-gray-900 leading-tight">Roti Dukaan</span>
                  {logoSubtitle}
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
        {visibleNavGroups.map((group) => (
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
                      badge={'badge' in item ? item.badge : undefined}
                      collapsed={false}
                disabled={('disabled' in item) ? item.disabled : false}
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
