"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/layout/sidebar-provider"
import { AdminAuthGuard } from "@/features/admin-auth/components/AdminAuthGuard"

const SIDEBAR_ROUTES = ["/dashboard", "/orders", "/deliveries", "/menu", "/customers", "/subscription-plans", "/subscriptions", "/subscription-operations", "/delivery-slots", "/reports", "/settings", "/admin", "/audit-logs", "/branches", "/cities", "/areas", "/branch/dashboard", "/branch/orders", "/branch/kitchen", "/branch/production", "/branch/menu", "/branch/inventory", "/branch/delivery", "/branch/dispatch", "/branch/customers", "/branch/reports", "/branch/profile", "/branch-inventory", "/support", "/branch/support", "/dispatch", "/cms", "/cms/banners"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const showSidebar = SIDEBAR_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))

  if (showSidebar) {
    return (
      <SidebarProvider>
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </SidebarProvider>
    )
  }

  return <>{children}</>
}
