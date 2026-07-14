"use client"

import * as React from "react"

const SIDEBAR_STATE_KEY = "rd-sidebar-collapsed"
const SIDEBAR_GROUPS_KEY = "rd-sidebar-groups"

export function useSidebar() {
  const [collapsed, setCollapsedState] = React.useState<boolean>(false)
  const [expandedGroups, setExpandedGroupsState] = React.useState<Record<string, boolean>>({})

  // Load persisted sidebar state after mount to avoid SSR/client hydration
  // mismatch (localStorage is unavailable on the server and may differ on the client).
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STATE_KEY)
      if (stored !== null) setCollapsedState(stored === "true")
    } catch {}
    try {
      const stored = localStorage.getItem(SIDEBAR_GROUPS_KEY)
      if (stored !== null) setExpandedGroupsState(JSON.parse(stored))
    } catch {}
  }, [])

  const setCollapsed = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setCollapsedState((prev) => {
      const next = typeof value === "function" ? value(prev) : value
      try {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [setCollapsed])

  const setGroupExpanded = React.useCallback((groupId: string, expanded: boolean) => {
    setExpandedGroupsState((prev) => {
      const next = { ...prev, [groupId]: expanded }
      try {
        localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const toggleGroup = React.useCallback((groupId: string) => {
    setExpandedGroupsState((prev) => {
      const current = prev[groupId] !== false
      const next = { ...prev, [groupId]: !current }
      try {
        localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const isGroupExpanded = React.useCallback(
    (groupId: string) => {
      return expandedGroups[groupId] !== false
    },
    [expandedGroups]
  )

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
    expandedGroups,
    setGroupExpanded,
    toggleGroup,
    isGroupExpanded,
  }
}
