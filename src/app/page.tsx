"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"

export default function HomePage() {
  const router = useRouter()
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const workspace = useAdminAuthStore((s) => s.workspace)
  const role = useAdminAuthStore((s) => s.role)

  React.useEffect(() => {
    if (isAuthenticated) {
      const resolvedWorkspace =
        workspace || (role === "BRANCH_MANAGER" ? "BRANCH_MANAGER" : "SUPER_ADMIN")
      router.replace(
        resolvedWorkspace === "BRANCH_MANAGER" ? "/branch/dashboard" : "/dashboard",
      )
    } else {
      router.replace("/login")
    }
  }, [router, isAuthenticated, workspace, role])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      <p className="mt-3 text-sm text-gray-500">Loading...</p>
    </div>
  )
}
