"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Bell, Search } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function Header({ title, subtitle, actions, className }: HeaderProps) {
  return (
    <header className={cn("sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6", className)}>
      <div className="flex items-center gap-4">
        {title && (
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>
        <Avatar alt="Admin" size="sm" />
      </div>
    </header>
  )
}
