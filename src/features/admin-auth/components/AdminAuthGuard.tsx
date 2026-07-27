"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAdminAuthStore } from "../store/admin-auth-store"
import {
  isDeliveryBoyAllowedPath,
  resolvePrimaryRole,
  workspaceFromRole,
} from "../utils/role-utils"

const PUBLIC_PATHS = ["/login"]

function syncAuthCookies(state: ReturnType<typeof useAdminAuthStore.getState>) {
  if (typeof document === "undefined") return

  const role = state.role || resolvePrimaryRole(state.user?.roles ?? [])
  const workspace = state.workspace || workspaceFromRole(role)

  if (workspace) {
    document.cookie = `workspace=${workspace}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
  }
  if (role) {
    document.cookie = `user-role=${role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
  }
  if (state.branchId) {
    document.cookie = `branch-id=${state.branchId}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
  }
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const workspace = useAdminAuthStore((s) => s.workspace)
  const role = useAdminAuthStore((s) => s.role)

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === "/"

  React.useEffect(() => {
    syncAuthCookies(useAdminAuthStore.getState())

    const currentWorkspace =
      workspace || workspaceFromRole(role) || 'SUPER_ADMIN'

    if (!isAuthenticated && !isPublic) {
      router.replace("/login")
      return
    }

    if (isAuthenticated && (pathname === "/login" || pathname === "/")) {
      if (currentWorkspace === "DELIVERY_BOY") {
        router.replace("/delivery")
      } else if (currentWorkspace === "BRANCH_MANAGER") {
        router.replace("/branch/dashboard")
      } else {
        router.replace("/dashboard")
      }
      return
    }

    if (
      isAuthenticated &&
      currentWorkspace === "DELIVERY_BOY" &&
      !isPublic &&
      !isDeliveryBoyAllowedPath(pathname)
    ) {
      router.replace("/delivery")
    }
  }, [pathname, router, isAuthenticated, workspace, role, isPublic])

  if (isPublic) return <>{children}</>

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
