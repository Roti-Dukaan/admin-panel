import type React from "react"

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  disabled?: boolean
  roles?: string[]
}

export interface NavGroup {
  id: string
  title: string
  items: NavItem[]
  roles?: string[]
}
