import { apiClient } from './http';
import type { ApiResponse } from '../types/api';

export interface BranchMenuAvailabilityItem {
  id: string;
  branchId: string;
  foodItemId: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISABLED';
  reason: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    name: string;
    code: string;
    city?: { id: string; name: string };
    area?: { id: string; name: string };
  };
  foodItem?: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    isVeg: boolean;
    basePrice: number;
    category?: { id: string; name: string };
  };
}

export interface BranchMenuSummary {
  totalItems: number;
  available: number;
  outOfStock: number;
  disabled: number;
  branchId: string;
  branchName: string;
}

export interface AvailabilityFilterParams {
  branchId?: string;
  status?: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISABLED';
  categoryId?: string;
  cityId?: string;
  areaId?: string;
  search?: string;
  issuesOnly?: boolean;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const branchMenuAvailabilityApi = {
  async adminList(params?: AvailabilityFilterParams): Promise<ApiResponse<PaginatedResponse<BranchMenuAvailabilityItem>>> {
    const { data } = await apiClient.get('/admin/branch-menu-availability', { params });
    return data;
  },

  async adminSummary(): Promise<ApiResponse<BranchMenuSummary[]>> {
    const { data } = await apiClient.get('/admin/branch-menu-availability/summary');
    return data;
  },

  async adminBranchList(branchId: string, params?: AvailabilityFilterParams): Promise<ApiResponse<BranchMenuAvailabilityItem[]>> {
    const { data } = await apiClient.get(`/admin/branch-menu-availability/branch/${branchId}`, { params });
    return data;
  },

  async adminUpdate(branchId: string, foodItemId: string, dto: { status: string; reason?: string }): Promise<ApiResponse<BranchMenuAvailabilityItem>> {
    const { data } = await apiClient.patch(`/admin/branch-menu-availability/branch/${branchId}/item/${foodItemId}`, dto);
    return data;
  },

  async managerList(): Promise<ApiResponse<BranchMenuAvailabilityItem[]>> {
    const { data } = await apiClient.get('/admin/branch/menu/availability');
    return data;
  },

  async managerSummary(): Promise<ApiResponse<BranchMenuSummary>> {
    const { data } = await apiClient.get('/admin/branch/menu/availability/summary');
    return data;
  },

  async managerUpdate(foodItemId: string, dto: { status: string; reason?: string }): Promise<ApiResponse<BranchMenuAvailabilityItem>> {
    const { data } = await apiClient.patch(`/admin/branch/menu/availability/${foodItemId}`, dto);
    return data;
  },
};
