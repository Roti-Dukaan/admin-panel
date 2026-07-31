"use client"

import * as React from "react"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"

export type Workspace = 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'DELIVERY_BOY'

export interface WorkspaceContextValue {
  workspace: Workspace | null
  role: string | null
  branchId: string | null
  permissions: string[]
  isBranchManager: boolean
  isDeliveryBoy: boolean
  isSuperAdmin: boolean
  isAuthenticated: boolean
}

export const WorkspaceContext = React.createContext<WorkspaceContextValue>({
  workspace: null,
  role: null,
  branchId: null,
  permissions: [],
  isBranchManager: false,
  isDeliveryBoy: false,
  isSuperAdmin: false,
  isAuthenticated: false,
})

export function useWorkspace() {
  return React.useContext(WorkspaceContext)
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const workspace = useAdminAuthStore((s) => s.workspace)
  const role = useAdminAuthStore((s) => s.role)
  const branchId = useAdminAuthStore((s) => s.branchId)
  const permissions = useAdminAuthStore((s) => s.permissions)
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)

  const isBranchManager = role === 'BRANCH_MANAGER'
  const isDeliveryBoy = role === 'DELIVERY_BOY'
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN'

  return (
    <WorkspaceContext.Provider value={{ workspace, role, branchId, permissions, isBranchManager, isDeliveryBoy, isSuperAdmin, isAuthenticated }}>
      {children}
    </WorkspaceContext.Provider>
  )
}
