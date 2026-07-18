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
  const [allowed, setAllowed] = React.useState<boolean | null>(null)

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === "/"

  React.useEffect(() => {
    useAdminAuthStore.persist.rehydrate()
    const authed = hasAdminSession()

    if (!authed && !isPublic) {
      router.replace("/login")
      setAllowed(false)
      return
    }
    if (authed && (pathname === "/login" || pathname === "/")) {
      router.replace("/dashboard")
      setAllowed(false)
      return
    }
    setAllowed(true)
  }, [pathname, router, isPublic])

  if (isPublic) return <>{children}</>
  if (allowed !== true) return null
  return <>{children}</>
}
