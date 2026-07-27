"use client"

import * as React from "react"
import { useAdminAuthStore } from "../store/admin-auth-store"
import { usePathname } from "next/navigation"
import { resolvePrimaryRole, workspaceFromRoles } from "../utils/role-utils"

export function useHydrateAdminAuthStore() {
  const pathname = usePathname()

  React.useEffect(() => {
    const unsubscribe = useAdminAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated) {
          const store = useAdminAuthStore.getState()
          if (store.user?.roles) {
            const role = resolvePrimaryRole(store.user.roles)
            const workspace = workspaceFromRoles(store.user.roles)
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
