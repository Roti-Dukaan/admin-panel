import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminAuthApi } from '../api/admin-auth.api';
import type { Workspace } from '@/contexts/WorkspaceContext';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
  branchId?: string | null;
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
        const role = user.roles?.[0] || null
        const workspace = role === 'BRANCH_MANAGER' ? 'BRANCH_MANAGER' : 'SUPER_ADMIN'
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
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          workspace: null,
          role: null,
          branchId: null,
          permissions: [],
        }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      setUser: (user) => {
        const role = user?.roles?.[0] || null
        const workspace = role === 'BRANCH_MANAGER' ? 'BRANCH_MANAGER' : 'SUPER_ADMIN'
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
    },
  ),
);
