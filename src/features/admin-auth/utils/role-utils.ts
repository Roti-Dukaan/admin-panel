import type { Workspace } from '@/contexts/WorkspaceContext'

const ROLE_PRIORITY = ['DELIVERY_BOY', 'BRANCH_MANAGER', 'SUPER_ADMIN', 'OWNER', 'ADMIN'] as const

export function resolvePrimaryRole(roles: string[] = []): string | null {
  if (!roles.length) return null
  for (const candidate of ROLE_PRIORITY) {
    if (roles.includes(candidate)) return candidate
  }
  return roles[0]
}

export function workspaceFromRole(role: string | null): Workspace | null {
  if (role === 'BRANCH_MANAGER') return 'BRANCH_MANAGER'
  if (role === 'DELIVERY_BOY') return 'DELIVERY_BOY'
  if (role) return 'SUPER_ADMIN'
  return null
}

export function workspaceFromRoles(roles: string[] = []): Workspace | null {
  return workspaceFromRole(resolvePrimaryRole(roles))
}

export function getPostLoginPath(roles: string[] = []): string {
  const workspace = workspaceFromRoles(roles)
  if (workspace === 'DELIVERY_BOY') return '/delivery'
  if (workspace === 'BRANCH_MANAGER') return '/branch/dashboard'
  return '/dashboard'
}

export const DELIVERY_BOY_ALLOWED_PATHS = ['/delivery'] as const

export function isDeliveryBoyAllowedPath(pathname: string): boolean {
  return DELIVERY_BOY_ALLOWED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}
