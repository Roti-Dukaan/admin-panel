"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

const SIDEBAR_ROUTES = ["/dashboard", "/orders", "/kitchen", "/menu", "/customers", "/subscription-plans", "/delivery-slots", "/reports", "/settings", "/admin"]

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  const showSidebar = SIDEBAR_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={cn(
          "transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        {children}
      </main>
    </div>
  )
}
