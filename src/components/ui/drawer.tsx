"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Drawer({ open, onOpenChange, children }: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 flex h-full w-full max-w-3xl flex-col bg-background shadow-xl animate-in slide-in-from-right duration-300">
        {children}
      </div>
    </div>
  )
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex shrink-0 items-center justify-between border-b p-6", className)} {...props} />
}

function DrawerTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-lg font-semibold", className)} {...props} />
}

function DrawerContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto p-6", className)} {...props} />
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t p-6", className)} {...props} />
}

function DrawerClose({ onClick, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={cn("rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

export { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose }
