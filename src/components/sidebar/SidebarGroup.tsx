"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarGroupProps {
  id: string
  title: string
  children: React.ReactNode
  collapsed?: boolean
  defaultExpanded?: boolean
  isExpanded?: boolean
  onToggle?: (id: string) => void
}

export function SidebarGroup({
  id,
  title,
  children,
  collapsed = false,
  defaultExpanded = true,
  isExpanded: controlledExpanded,
  onToggle,
}: SidebarGroupProps) {
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded)
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (onToggle) {
      onToggle(id)
    } else {
      setInternalExpanded((prev) => !prev)
    }
  }

  if (collapsed) {
    return (
      <div className="py-1.5">
        <div className="mx-3 my-1 h-px bg-gray-100 first:hidden" />
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ collapsed?: boolean }>, {
              collapsed: true,
            })
          }
          return child
        })}
      </div>
    )
  }

  return (
    <div className="py-1">
      <button
        onClick={handleToggle}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400",
          "hover:text-gray-500 transition-colors duration-200"
        )}
        aria-expanded={isExpanded}
      >
        <motion.span
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex items-center"
        >
          <ChevronDown className="h-3 w-3" />
        </motion.span>
        <span>{title}</span>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child as React.ReactElement<{ collapsed?: boolean }>, {
                    collapsed: false,
                  })
                }
                return child
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
