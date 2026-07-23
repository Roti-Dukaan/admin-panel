"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/sidebar/Sidebar"

export function BranchLayout({ 
  children,
  title = "Branch Workspace",
  subtitle = "Branch Manager Portal"
}: { 
  children: React.ReactNode
  title?: string
  subtitle?: string
}) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50/50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <main
        className={cn(
          "transition-all duration-300",
          "lg:ml-[260px]",
          collapsed && "lg:ml-[72px]"
        )}
      >
        <Header title={title} subtitle={subtitle} />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
