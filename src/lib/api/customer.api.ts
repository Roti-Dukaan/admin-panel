import { apiClient } from './http';
import type { ApiResponse, PaginatedData } from '../types/api';

export interface ApiCustomerBranch {
  id: string;
  name: string;
  code: string;
}

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
  branchId: string | null;
  branch: ApiCustomerBranch | null;
  subscriptionPlanName?: string | null;
}

export interface ApiCustomerDetail extends ApiCustomer {
  profileImage: string | null;
  dateOfBirth: string | null;
  _count: { orders: number; addresses: number };
}

export interface ApiCustomerAddress {
  id: string;
  customerId: string;
  label: string;
  receiverName: string;
  phoneNumber: string;
  houseNumber: string;
  apartment: string | null;
  street: string;
  landmark: string | null;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  deliveryInstructions: string | null;
  isDefault: boolean;
  isServiceable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  branchId?: string;
  hasSubscription?: boolean;
}

export interface CustomerListStats {
  total: number;
  active: number;
  inactive: number;
}

export interface CustomerListData extends PaginatedData<ApiCustomer> {
  stats?: CustomerListStats;
}

export const customerApi = {
  async list(params?: CustomerQueryParams): Promise<ApiResponse<CustomerListData>> {
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

  async getAddresses(customerId: string): Promise<ApiResponse<{ customer: { id: string; fullName: string | null; email: string | null; phone: string | null }; addresses: ApiCustomerAddress[]; total: number }>> {
    const { data } = await apiClient.get(`/admin/customers/${customerId}/addresses`);
    return data;
  },
};
