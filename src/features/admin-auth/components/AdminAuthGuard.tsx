"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAdminAuthStore } from "../store/admin-auth-store"

const PUBLIC_PATHS = ["/login"]

function hasAdminSession(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem("admin-auth")
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return !!parsed?.state?.isAuthenticated && !!parsed?.state?.accessToken
  } catch {
    return false
  }
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = React.useState(false)

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === "/"

  React.useEffect(() => {
    useAdminAuthStore.persist.rehydrate()
    const state = useAdminAuthStore.getState()

    if (state.workspace && !document.cookie.includes("workspace=")) {
      document.cookie = `workspace=${state.workspace}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    }
    if (state.role && !document.cookie.includes("user-role=")) {
      document.cookie = `user-role=${state.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    }
    if (state.branchId && !document.cookie.includes("branch-id=")) {
      document.cookie = `branch-id=${state.branchId}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    }

    const authed = hasAdminSession()
    const currentWorkspace = state.workspace || (state.role === "BRANCH_MANAGER" ? "BRANCH_MANAGER" : "SUPER_ADMIN")

    if (!authed && !PUBLIC_PATHS.includes(pathname) && pathname !== "/") {
      router.replace("/login")
      setReady(false)
      return
    }

    if (authed && (pathname === "/login" || pathname === "/")) {
      router.replace(currentWorkspace === "BRANCH_MANAGER" ? "/branch/dashboard" : "/dashboard")
      setReady(false)
      return
    }

    setReady(true)
  }, [pathname, router])

  if (isPublic) return <>{children}</>
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }
  return <>{children}</>
}
