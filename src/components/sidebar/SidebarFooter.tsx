"use client"

import * as React from "react"
import { LogOut, User, KeyRound, ChevronUp } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"

interface SidebarFooterProps {
  collapsed?: boolean
}

export function SidebarFooter({ collapsed = false }: SidebarFooterProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
          "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          collapsed && "justify-center px-2"
        )}
        aria-label="Admin menu"
        aria-expanded={open}
      >
        <Avatar alt="Admin" size="sm" className="ring-2 ring-gray-100 shrink-0" />
        {!collapsed && (
          <>
            <div className="flex flex-1 flex-col items-start">
              <span className="font-medium text-gray-900 leading-tight">Admin</span>
              <span className="text-[11px] text-gray-900 leading-tight">Super Admin</span>
            </div>
            <ChevronUp
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>
      <AnimatePresence>
        {open && !collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-2 right-2 mb-2 rounded-xl border border-gray-200 bg-white p-1 shadow-lg z-[60]"
          >
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <User className="h-4 w-4 text-gray-400" />
              Profile
            </button>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <KeyRound className="h-4 w-4 text-gray-400" />
              Change Password
            </button>
            <div className="my-1 h-px bg-gray-100" />
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
