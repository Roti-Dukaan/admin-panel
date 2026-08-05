"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/layout/sidebar-provider"
import { AdminAuthGuard } from "@/features/admin-auth/components/AdminAuthGuard"
import { BranchOrderAlertProvider } from "@/features/orders/components/BranchOrderAlertProvider"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { hydrateAdminAuth } from "@/lib/auth/hydrate-admin-auth"

const SIDEBAR_ROUTES = [
  "/dashboard",
  "/orders",
  "/deliveries",
  "/menu",
  "/subscription-menu",
  "/customers",
  "/subscription-plans",
  "/subscriptions",
  "/subscription-operations",
  "/delivery-slots",
  "/reports",
  "/settings",
  "/admin",
  "/audit-logs",
  "/branches",
  "/cities",
  "/areas",
  "/branch/dashboard",
  "/branch/orders",
  "/branch/kitchen",
  "/branch/subscription-dispatch",
  "/branch/production",
  "/branch/menu",
  "/branch/inventory",
  "/branch/delivery",
  "/branch/dispatch",
  "/branch/delivery-boys",
  "/branch/customers",
  "/branch/team",
  "/branch/reports",
  "/branch/profile",
  "/branch-inventory",
  "/support",
  "/branch/support",
  "/dispatch",
  "/cms",
  "/cms/banners",
  "/contact-messages",
  "/coupons",
]

const PUBLIC_ROUTES = ["/login", "/invitations"]

function isPublicRoute(pathname: string): boolean {
  return pathname === "/" || PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

const AUTH_GUARD_ROUTES = ["/delivery"]

function isAuthGuardRoute(pathname: string): boolean {
  return AUTH_GUARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}
function isSidebarRoute(pathname: string): boolean {
  return SIDEBAR_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isBranchManager, isAuthenticated } = useWorkspace()
  const showSidebar = isSidebarRoute(pathname)
  const needsAuth = showSidebar || isAuthGuardRoute(pathname)
  const [authReady, setAuthReady] = React.useState(false)

  const isPublic = isPublicRoute(pathname)

  React.useEffect(() => hydrateAdminAuth(() => setAuthReady(true)), [])

  // Public routes (login, invitations) render immediately — never block behind auth hydration.
  if (!authReady && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  const page = showSidebar ? (
    <SidebarProvider>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </SidebarProvider>
  ) : needsAuth ? (
    <AdminAuthGuard>{children}</AdminAuthGuard>
  ) : (
    children
  )

  // Global alert layer for branch managers — stays mounted across page navigation
  // and token refresh so socket listeners and poll backup are never torn down.
  if (isBranchManager && !isPublicRoute(pathname)) {
    return <BranchOrderAlertProvider>{page}</BranchOrderAlertProvider>
  }

  return <>{page}</>
}