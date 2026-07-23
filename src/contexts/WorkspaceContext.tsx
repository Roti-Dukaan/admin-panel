"use client"

import * as React from "react"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"

export type Workspace = 'SUPER_ADMIN' | 'BRANCH_MANAGER'

export interface WorkspaceContextValue {
  workspace: Workspace | null
  role: string | null
  branchId: string | null
  permissions: string[]
  isBranchManager: boolean
  isSuperAdmin: boolean
}

export const WorkspaceContext = React.createContext<WorkspaceContextValue>({
  workspace: null,
  role: null,
  branchId: null,
  permissions: [],
  isBranchManager: false,
  isSuperAdmin: false,
})

export function useWorkspace() {
  return React.useContext(WorkspaceContext)
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const workspace = useAdminAuthStore((s) => s.workspace)
  const role = useAdminAuthStore((s) => s.role)
  const branchId = useAdminAuthStore((s) => s.branchId)
  const permissions = useAdminAuthStore((s) => s.permissions)

  React.useEffect(() => {
    useAdminAuthStore.persist.rehydrate()
    setMounted(true)
  }, [])

  const isBranchManager = role === 'BRANCH_MANAGER'
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN'

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WorkspaceContext.Provider value={{ workspace, role, branchId, permissions, isBranchManager, isSuperAdmin }}>
      {children}
    </WorkspaceContext.Provider>
  )
}
