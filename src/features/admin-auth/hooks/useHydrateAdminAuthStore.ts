"use client"

import * as React from "react"
import { useAdminAuthStore } from "../store/admin-auth-store"
import { usePathname } from "next/navigation"

export function useHydrateAdminAuthStore() {
  const pathname = usePathname()

  React.useEffect(() => {
    const unsubscribe = useAdminAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated) {
          const store = useAdminAuthStore.getState()
          if (store.user?.roles) {
            const role = store.user.roles[0] || null
            const workspace = role === 'BRANCH_MANAGER' ? 'BRANCH_MANAGER' : 'SUPER_ADMIN'
            if (store.role !== role || store.workspace !== workspace) {
              store.setUser(store.user)
            }
          }
        }
      },
    )

    return () => unsubscribe()
  }, [])

  return useAdminAuthStore((s) => ({
    user: s.user,
    setUser: s.setUser,
    setWorkspace: s.setWorkspace,
  }))
}
