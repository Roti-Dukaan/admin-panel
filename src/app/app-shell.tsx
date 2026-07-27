"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/layout/sidebar-provider"
import { AdminAuthGuard } from "@/features/admin-auth/components/AdminAuthGuard"
import { BranchOrderAlertProvider } from "@/features/orders/components/BranchOrderAlertProvider"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"
import { useWorkspace } from "@/contexts/WorkspaceContext"

const SIDEBAR_ROUTES = [
  "/dashboard",
  "/orders",
  "/deliveries",
  "/menu",
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
  "/branch/production",
  "/branch/menu",
  "/branch/inventory",
  "/branch/delivery",
  "/branch/dispatch",
  "/branch/customers",
  "/branch/team",
  "/branch/reports",
  "/branch/profile",
  "/branch-inventory",
  "/support",
  "/branch/support",
  "/dispatch",
]

function isSidebarRoute(pathname: string): boolean {
  return SIDEBAR_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isBranchManager, isAuthenticated } = useWorkspace()
  const showSidebar = isSidebarRoute(pathname)
  const [authReady, setAuthReady] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = useAdminAuthStore.persist.onFinishHydration(() => {
      setAuthReady(true)
    })

    if (useAdminAuthStore.persist.hasHydrated()) {
      setAuthReady(true)
    } else {
      useAdminAuthStore.persist.rehydrate()
    }

    return unsubscribe
  }, [])

  if (!authReady) {
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
  ) : (
    children
  )

  // Global alert layer for branch managers - must not depend on sidebar routes.
  if (isBranchManager && isAuthenticated) {
    return <BranchOrderAlertProvider>{page}</BranchOrderAlertProvider>
  }

  return <>{page}</>
}
