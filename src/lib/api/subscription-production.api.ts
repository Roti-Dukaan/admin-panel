import { apiClient } from './http';
import type { ApiResponse } from '../types/api';

export interface SubscriptionProductionItem {
  id: string;
  branchId: string;
  productionDate: string;
  deliverySlot: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  generatedAt: string;
  generatedBy: string | null;
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  items?: SubscriptionProductionItemDetail[];
}

export interface SubscriptionProductionItemDetail {
  id: string;
  productionId: string;
  subscriptionId: string;
  planName: string | null;
  deliverySlot: string;
  quantity: number;
  mealSnapshot: MealSnapshot;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  subscription?: {
    id: string;
    customer?: { id: string; fullName: string; name: string; phone: string };
    branch?: { id: string; name: string };
  };
}

export interface MealSnapshot {
  foodItemId: string;
  foodItemName: string;
  foodItemSlug: string;
  isVeg: boolean;
  categoryId: string;
  categoryName: string;
  basePrice: number;
  gstRate: number;
}

export interface ProductionSummary {
  totalProductions: number;
  byStatus: Record<string, number>;
  bySlot: Record<string, number>;
  byBranch: Array<{
    branchId: string;
    branchName: string;
    total: number;
    byStatus: Record<string, number>;
    bySlot: Record<string, number>;
  }>;
}

export interface DaySummary {
  date: string;
  totalProductions: number;
  totalItems: number;
  totalQuantity: number;
  byStatus: Record<string, number>;
  bySlot: Record<string, number>;
  branches: Array<{
    branchId: string;
    branchName: string;
    branchCode: string;
    totalProductions: number;
    totalItems: number;
    byStatus: Record<string, number>;
    bySlot: Record<string, number>;
  }>;
}

export interface CookingSheet {
  branchId: string;
  branchName: string;
  branchCode: string;
  date: string;
  deliverySlot: string | null;
  generatedAt: string;
  items: CookingSheetItem[];
  totals: {
    totalItems: number;
    totalQuantity: number;
    byFoodItem: Array<{
      foodItemId: string;
      foodItemName: string;
      isVeg: boolean;
      categoryName: string;
      totalQuantity: number;
      subscriptions: number;
    }>;
  };
}

export interface CookingSheetItem {
  subscriptionId: string;
  customerName: string;
  customerPhone: string;
  deliverySlot: string;
  address: string | null;
  items: CookingSheetItemDetail[];
}

export interface CookingSheetItemDetail {
  productionItemId: string;
  foodItemId: string;
  foodItemName: string;
  isVeg: boolean;
  categoryName: string;
  quantity: number;
  basePrice: number;
  gstRate: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
}

export interface ProductionQueryParams {
  branchId?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  deliverySlot?: string;
  productionDate?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ProductionUpcomingItem {
  subscriptionId: string;
  planName: string | null;
  branch: { id: string; name: string } | null;
  hasToday: boolean;
  hasTomorrow: boolean;
  todayStatus: string | null;
  tomorrowStatus: string | null;
  nextOccurrenceDate: string | null;
}

export interface UpdateProductionStatusDto {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const subscriptionProductionApi = {
  async adminList(params?: ProductionQueryParams): Promise<ApiResponse<PaginatedResponse<SubscriptionProductionItem>>> {
    const { data } = await apiClient.get('/admin/subscription-production', { params });
    return data;
  },

  async adminToday(): Promise<ApiResponse<DaySummary>> {
    const { data } = await apiClient.get('/admin/subscription-production/today');
    return data;
  },

  async adminTomorrow(): Promise<ApiResponse<DaySummary>> {
    const { data } = await apiClient.get('/admin/subscription-production/tomorrow');
    return data;
  },

  async adminSummary(date: string): Promise<ApiResponse<DaySummary>> {
    const { data } = await apiClient.get('/admin/subscription-production/summary', { params: { date } });
    return data;
  },

  async adminBranch(
    branchId: string,
    date?: string,
    slot?: string,
  ): Promise<ApiResponse<SubscriptionProductionItem[]>> {
    const { data } = await apiClient.get(`/admin/subscription-production/branch/${branchId}`, { params: { date, slot } });
    return data;
  },

  async adminCookingSheet(
    branchId: string,
    date: string,
    slot?: string,
  ): Promise<ApiResponse<CookingSheet>> {
    const { data } = await apiClient.get(`/admin/subscription-production/cooking-sheet/${branchId}`, { params: { date, slot } });
    return data;
  },

  async adminUpdateStatus(
    id: string,
    dto: UpdateProductionStatusDto,
  ): Promise<ApiResponse<SubscriptionProductionItem>> {
    const { data } = await apiClient.patch(`/admin/subscription-production/${id}/status`, dto);
    return data;
  },

  async adminGenerate(date: string): Promise<ApiResponse<{ created: number; skipped: number }>> {
    const { data } = await apiClient.get(`/admin/subscription-production/generate/${date}`);
    return data;
  },

  async adminDetail(id: string): Promise<ApiResponse<SubscriptionProductionItem>> {
    const { data } = await apiClient.get(`/admin/subscription-production/${id}`);
    return data;
  },

  async managerList(date?: string, slot?: string): Promise<ApiResponse<SubscriptionProductionItem[]>> {
    const { data } = await apiClient.get('/admin/branch/production', { params: { date, slot } });
    return data;
  },

  async managerSummary(date?: string): Promise<ApiResponse<DaySummary>> {
    const { data } = await apiClient.get('/admin/branch/production/summary', { params: { date } });
    return data;
  },

  async managerCookingSheet(date: string, slot?: string): Promise<ApiResponse<CookingSheet>> {
    const { data } = await apiClient.get('/admin/branch/production/cooking-sheet', { params: { date, slot } });
    return data;
  },

  async managerUpdateStatus(
    id: string,
    dto: UpdateProductionStatusDto,
  ): Promise<ApiResponse<SubscriptionProductionItem>> {
    const { data } = await apiClient.patch(`/admin/branch/production/${id}/status`, dto);
    return data;
  },

  async customerUpcoming(): Promise<ApiResponse<ProductionUpcomingItem[]>> {
    const { data } = await apiClient.get('/customer/subscription-production/upcoming');
    return data;
  },
};