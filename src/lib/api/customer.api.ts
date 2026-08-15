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
  activeKitchenOrderCount?: number;
}

export interface ApiCustomerDetail extends ApiCustomer {
  profileImage: string | null;
  dateOfBirth: string | null;
  _count: { orders: number; addresses: number };
  activeKitchenOrderCount?: number;
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

export interface ApiCustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string | null;
  deliveryType: string | null;
  grandTotal: number;
  totalQuantity: number;
  itemCount: number;
  createdAt: string;
  deliveredAt: string | null;
  items: Array<{ foodNameSnapshot: string; quantity: number }>;
}

export interface ApiCustomerCartItem {
  id: string;
  foodNameSnapshot: string;
  categorySnapshot: string | null;
  quantity: number;
  lineTotal: number;
}

export interface ApiCustomerCart {
  id: string;
  totalItems: number;
  totalQuantity: number;
  grandTotal: number;
  paymentMethod: string | null;
  specialInstructions: string | null;
  updatedAt: string;
  items: ApiCustomerCartItem[];
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

  async getOrders(
    customerId: string,
    params?: { page?: number; limit?: number },
  ): Promise<ApiResponse<PaginatedData<ApiCustomerOrder>>> {
    const { data } = await apiClient.get(`/admin/customers/${customerId}/orders`, { params });
    return data;
  },

  async getCart(customerId: string): Promise<ApiResponse<{ cart: ApiCustomerCart | null }>> {
    const { data } = await apiClient.get(`/admin/customers/${customerId}/cart`);
    return data;
  },
};
