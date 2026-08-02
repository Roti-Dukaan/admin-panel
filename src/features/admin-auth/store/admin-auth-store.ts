import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reconnectRealtimeWithAuth, resetRealtimeAuth } from '@/lib/realtime/socket';
import type { Workspace } from '@/contexts/WorkspaceContext';
import { resolvePrimaryRole, workspaceFromRole } from '../utils/role-utils';

function clearAuthCookies() {
  if (typeof document === 'undefined') return
  for (const name of ['workspace', 'user-role', 'branch-id']) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
  }
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
  branchId?: string | null;
  branch?: { id: string; name: string; code: string } | null;
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  workspace: Workspace | null;
  role: string | null;
  branchId: string | null;
  permissions: string[];
  login: (user: AdminUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUser: (user: AdminUser | null) => void;
  setWorkspace: (workspace: Workspace) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      workspace: null,
      role: null,
      branchId: null,
      permissions: [],

      login: (user, accessToken, refreshToken) => {
        const role = resolvePrimaryRole(user.roles)
        const workspace = workspaceFromRole(role)
        set({
          user,
          isAuthenticated: true,
          accessToken,
          refreshToken,
          workspace,
          role,
          branchId: user.branchId || null,
          permissions: user.permissions || [],
        })
        reconnectRealtimeWithAuth()
      },

      logout: () => {
        resetRealtimeAuth()
        clearAuthCookies()
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          workspace: null,
          role: null,
          branchId: null,
          permissions: [],
        })
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
        if (accessToken) reconnectRealtimeWithAuth()
      },

      setUser: (user) => {
        const role = user ? resolvePrimaryRole(user.roles) : null
        const workspace = workspaceFromRole(role)
        set({
          user,
          isAuthenticated: !!user,
          workspace,
          role,
          branchId: user?.branchId || null,
          permissions: user?.permissions || [],
        })
      },

      setWorkspace: (workspace) => set({ workspace }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        workspace: state.workspace,
        role: state.role,
        branchId: state.branchId,
        permissions: state.permissions,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state?.user?.roles?.length) return
        const role = resolvePrimaryRole(state.user.roles)
        const workspace = workspaceFromRole(role)
        if (state.role !== role || state.workspace !== workspace) {
          state.role = role
          state.workspace = workspace
        }
      },
    },
  ),
);
