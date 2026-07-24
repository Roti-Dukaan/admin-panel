import { create } from 'zustand';
import { Role, RBACUser, AuditEntry, RBACModule, PermissionAction, RoleStatus } from '../types/role';
import { mockRoles, mockUsers, mockAuditEntries } from '../mock/roles';

interface RoleFilters {
  search: string;
  status: RoleStatus | 'all';
  type: 'all' | 'system' | 'custom';
}

interface RoleStore {
  roles: Role[];
  users: RBACUser[];
  auditEntries: AuditEntry[];
  filters: RoleFilters;
  selectedRole: Role | null;
  drawerOpen: boolean;
  drawerMode: 'view' | 'edit' | 'create';
  cloneDialogOpen: boolean;
  cloneSourceRole: Role | null;
  deleteModalOpen: boolean;
  roleToDelete: Role | null;

  setSearch: (search: string) => void;
  setStatusFilter: (status: RoleFilters['status']) => void;
  setTypeFilter: (type: RoleFilters['type']) => void;
  clearFilters: () => void;

  setSelectedRole: (role: Role | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerMode: (mode: 'view' | 'edit') => void;
  setCloneDialogOpen: (open: boolean) => void;
  setCloneSourceRole: (role: Role | null) => void;
  setDeleteModalOpen: (open: boolean) => void;
  setRoleToDelete: (role: Role | null) => void;

  getFilteredRoles: () => Role[];
  getStats: () => {
    totalRoles: number;
    activeUsers: number;
    customRoles: number;
    systemRoles: number;
    inactiveUsers: number;
    pendingInvitations: number;
  };
  getRoleById: (id: string) => Role | undefined;
  getUsersByRole: (roleId: string) => RBACUser[];
  getAllUsers: () => RBACUser[];
  getUnassignedUsers: (roleId: string) => RBACUser[];

  createRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Role;
  updateRole: (id: string, updates: Partial<Role>) => void;
  cloneRole: (sourceId: string, newName: string) => Role;
  archiveRole: (id: string) => void;
  deleteRole: (id: string) => void;
  assignUser: (roleId: string, userId: string) => void;
  removeUser: (roleId: string, userId: string) => void;

  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
}

const initialFilters: RoleFilters = {
  search: '',
  status: 'all',
  type: 'all',
};

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: mockRoles,
  users: mockUsers,
  auditEntries: mockAuditEntries,
  filters: { ...initialFilters },
  selectedRole: null,
  drawerOpen: false,
  drawerMode: 'view',
  cloneDialogOpen: false,
  cloneSourceRole: null,
  deleteModalOpen: false,
  roleToDelete: null,

  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
  setStatusFilter: (status) => set((state) => ({ filters: { ...state.filters, status } })),
  setTypeFilter: (type) => set((state) => ({ filters: { ...state.filters, type } })),
  clearFilters: () => set({ filters: { ...initialFilters } }),

  setSelectedRole: (role) => set({ selectedRole: role }),
  setDrawerOpen: (open) => set((state) => ({
    drawerOpen: open,
    selectedRole: open ? state.selectedRole : null,
  })),
  setDrawerMode: (mode) => set({ drawerMode: mode }),
  setCloneDialogOpen: (open) => set({ cloneDialogOpen: open }),
  setCloneSourceRole: (role) => set({ cloneSourceRole: role }),
  setDeleteModalOpen: (open) => set({ deleteModalOpen: open }),
  setRoleToDelete: (role) => set({ roleToDelete: role }),

  getFilteredRoles: () => {
    const { roles, filters } = get();
    let filtered = [...roles];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.type === 'system') {
      filtered = filtered.filter((r) => r.isSystem);
    } else if (filters.type === 'custom') {
      filtered = filtered.filter((r) => !r.isSystem);
    }

    return filtered;
  },

  getStats: () => {
    const { roles, users } = get();
    return {
      totalRoles: roles.length,
      activeUsers: users.filter((u) => u.status === 'active').length,
      customRoles: roles.filter((r) => !r.isSystem).length,
      systemRoles: roles.filter((r) => r.isSystem).length,
      inactiveUsers: users.filter((u) => u.status === 'inactive').length,
      pendingInvitations: 3,
    };
  },

  getRoleById: (id) => {
    return get().roles.find((r) => r.id === id);
  },

  getUsersByRole: (roleId) => {
    return get().users.filter((u) => u.roleId === roleId);
  },

  getAllUsers: () => {
    return get().users;
  },

  getUnassignedUsers: (roleId) => {
    return get().users.filter((u) => u.roleId !== roleId);
  },

  createRole: (roleData) => {
    const newRole: Role = {
      ...roleData,
      id: `role-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({ roles: [...state.roles, newRole] }));
    get().addAuditEntry({
      action: 'role_created',
      roleId: newRole.id,
      roleName: newRole.name,
      performedBy: 'Current User',
      details: `Created new role "${newRole.name}" with ${newRole.permissions.length} module permissions`,
    });
    return newRole;
  },

  updateRole: (id, updates) => {
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
      ),
    }));
    const role = get().getRoleById(id);
    if (role) {
      get().addAuditEntry({
        action: 'permission_updated',
        roleId: id,
        roleName: role.name,
        performedBy: 'Current User',
        details: `Updated role "${role.name}" permissions and settings`,
      });
    }
  },

  cloneRole: (sourceId, newName) => {
    const source = get().getRoleById(sourceId);
    if (!source) throw new Error('Source role not found');
    const newRole = get().createRole({
      name: newName,
      description: `Cloned from ${source.name}`,
      color: source.color,
      icon: source.icon,
      status: 'active',
      isSystem: false,
      permissions: JSON.parse(JSON.stringify(source.permissions)),
      usersAssigned: [],
      hierarchyLevel: source.hierarchyLevel + 1,
    });
    get().addAuditEntry({
      action: 'role_cloned',
      roleId: newRole.id,
      roleName: newRole.name,
      performedBy: 'Current User',
      details: `Cloned "${source.name}" to create "${newName}"`,
    });
    return newRole;
  },

  archiveRole: (id) => {
    const role = get().getRoleById(id);
    if (role) {
      set((state) => ({
        roles: state.roles.map((r) =>
          r.id === id ? { ...r, status: 'inactive' as RoleStatus, updatedAt: Date.now() } : r
        ),
      }));
      get().addAuditEntry({
        action: 'role_archived',
        roleId: id,
        roleName: role.name,
        performedBy: 'Current User',
        details: `Archived role "${role.name}"`,
      });
    }
  },

  deleteRole: (id) => {
    const role = get().getRoleById(id);
    if (role && !role.isSystem) {
      set((state) => ({
        roles: state.roles.filter((r) => r.id !== id),
      }));
      get().addAuditEntry({
        action: 'role_deleted',
        roleId: id,
        roleName: role.name,
        performedBy: 'Current User',
        details: `Deleted role "${role.name}"`,
      });
    }
  },

  assignUser: (roleId, userId) => {
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === roleId
          ? { ...r, usersAssigned: [...r.usersAssigned, userId], updatedAt: Date.now() }
          : r
      ),
      users: state.users.map((u) =>
        u.id === userId ? { ...u, roleId } : u
      ),
    }));
    const role = get().getRoleById(roleId);
    const user = get().users.find((u) => u.id === userId);
    if (role && user) {
      get().addAuditEntry({
        action: 'user_assigned',
        roleId,
        roleName: role.name,
        performedBy: 'Current User',
        details: `Assigned ${user.name} to "${role.name}" role`,
      });
    }
  },

  removeUser: (roleId, userId) => {
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === roleId
          ? { ...r, usersAssigned: r.usersAssigned.filter((id) => id !== userId), updatedAt: Date.now() }
          : r
      ),
    }));
    const role = get().getRoleById(roleId);
    const user = get().users.find((u) => u.id === userId);
    if (role && user) {
      get().addAuditEntry({
        action: 'user_removed',
        roleId,
        roleName: role.name,
        performedBy: 'Current User',
        details: `Removed ${user.name} from "${role.name}" role`,
      });
    }
  },

  addAuditEntry: (entry) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      auditEntries: [newEntry, ...state.auditEntries],
    }));
  },
}));
