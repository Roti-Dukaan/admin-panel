"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { cn } from "@/lib/utils"

const SIDEBAR_ROUTES = ["/dashboard", "/orders", "/kitchen", "/menu", "/customers", "/subscription-plans", "/delivery-slots", "/reports", "/settings", "/admin"]

interface SidebarContextValue {
  mobileOpen: boolean
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const SidebarContext = React.createContext<SidebarContextValue>({
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function useSidebarMobile() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const showSidebar = SIDEBAR_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div className="min-h-screen bg-gray-50/50">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main
          className={cn(
            "transition-all duration-300",
            "lg:ml-[260px]",
            collapsed && "lg:ml-[72px]"
          )}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
