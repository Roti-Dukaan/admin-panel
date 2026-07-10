import { apiClient } from './http';
import type { ApiResponse, PaginatedData } from '../types/api';

export interface ApiCustomer {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  name: string | null;
  gender: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCustomerDetail extends ApiCustomer {
  profileImage: string | null;
  dateOfBirth: string | null;
  _count: { orders: number; addresses: number };
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const customerApi = {
  async list(params?: CustomerQueryParams): Promise<ApiResponse<PaginatedData<ApiCustomer>>> {
    const { data } = await apiClient.get('/admin/customers', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<ApiCustomerDetail>> {
    const { data } = await apiClient.get(`/admin/customers/${id}`);
    return data;
  },

  async updateStatus(id: string, isActive: boolean): Promise<ApiResponse<{ id: string; isActive: boolean }>> {
    const { data } = await apiClient.patch(`/admin/customers/${id}/status`, { isActive });
    return data;
  },
};
