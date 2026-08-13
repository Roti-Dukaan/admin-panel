import { apiClient } from '@/lib/api/http';
import { normalizeEmail } from '@/lib/utils/email';

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
    name: string | null;
    roles: string[];
    permissions: string[];
    branchId?: string | null;
  };
}

export interface CurrentAdminResponse {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
  branchId?: string | null;
}

export const adminAuthApi = {
  async sendOtp(email: string): Promise<{ otp?: string; message: string }> {
    const { data } = await apiClient.post('/admin-auth/send-otp', { email: normalizeEmail(email) });
    return data.data;
  },

  async login(email: string, otp: string): Promise<AdminLoginResponse> {
    const { data } = await apiClient.post('/admin-auth/login', { email: normalizeEmail(email), otp });
    return data.data;
  },

  async me(): Promise<CurrentAdminResponse> {
    const { data } = await apiClient.get('/admin-auth/me');
    return data.data;
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data } = await apiClient.post('/admin-auth/refresh', { refreshToken });
    return data.data;
  },

  async logout(refreshToken: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/admin-auth/logout', { refreshToken });
    return data.data;
  },
};
