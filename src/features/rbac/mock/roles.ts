import { Role, RBACUser, AuditEntry, ModulePermission, PermissionAction } from '../types/role';

const now = Date.now();

function p(module: ModulePermission['module'], actions: PermissionAction[]): ModulePermission {
  return { module, actions };
}

export const mockRoles: Role[] = [] as Role[];

export const mockUsers: RBACUser[] = [] as RBACUser[];

export const mockAuditEntries: AuditEntry[] = [] as AuditEntry[];

export const ROLE_HIERARCHY = [] as Array<{ id: string; name: string; level: number; color: string }>;