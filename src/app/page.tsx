"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = React.useState(true)

  React.useEffect(() => {
    useAdminAuthStore.persist.rehydrate()
    const state = useAdminAuthStore.getState()

    if (state.isAuthenticated) {
      const workspace = state.workspace || (state.role === 'BRANCH_MANAGER' ? 'BRANCH_MANAGER' : 'SUPER_ADMIN')
      router.replace(workspace === 'BRANCH_MANAGER' ? '/branch/dashboard' : '/dashboard')
    } else {
      router.replace('/login')
    }
    setChecking(false)
  }, [router])

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  return null
}
