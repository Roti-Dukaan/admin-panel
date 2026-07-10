import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminAuthApi } from '../api/admin-auth.api';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: AdminUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUser: (user: AdminUser | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,

      login: (user, accessToken, refreshToken) =>
        set({ user, isAuthenticated: true, accessToken, refreshToken }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
