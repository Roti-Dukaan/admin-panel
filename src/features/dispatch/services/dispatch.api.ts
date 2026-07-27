import { apiClient } from "@/lib/api/http";
import type {
  DispatchDashboard,
  DispatchBatchListResponse,
  DispatchBatchDetail,
} from "../types/dispatch";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export interface DispatchQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const dispatchApi = {
  /** GET /admin/dispatch/dashboard */
  getDashboard: (): Promise<DispatchDashboard> =>
    unwrap(apiClient.get("/admin/dispatch/dashboard")),

  /** GET /admin/dispatch/batches */
  listBatches: (query: DispatchQuery = {}): Promise<DispatchBatchListResponse> => {
    const params = new URLSearchParams();
    if (query.status) params.append("status", query.status);
    if (query.search) params.append("search", query.search);
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    return unwrap(apiClient.get(`/admin/dispatch/batches?${params.toString()}`));
  },

  /** GET /admin/dispatch/batches/:id */
  getBatchDetail: (id: string): Promise<DispatchBatchDetail> =>
    unwrap(apiClient.get(`/admin/dispatch/batches/${id}`)),

  /** POST /admin/dispatch/batches */
  createBatch: (data: {
    orderIds: string[];
    deliveryZone?: string;
    provider?: string;
    deliverySlotId?: string;
  }): Promise<{ id: string; batchNumber: string; totalOrders: number; status: string }> =>
    unwrap(apiClient.post("/admin/dispatch/batches", data)),

  /** PATCH /admin/dispatch/batches/:id/assign */
  assignBatch: (id: string, data: { driverCount: number; providerBatchId?: string }) =>
    unwrap(apiClient.patch(`/admin/dispatch/batches/${id}/assign`, data)),

  /** PATCH /admin/dispatch/batches/:id/status */
  updateBatchStatus: (id: string, status: string) =>
    unwrap(apiClient.patch(`/admin/dispatch/batches/${id}/status`, { status })),

  /** GET /admin/dispatch/batches/ready-orders */
  getReadyOrders: () =>
    unwrap(apiClient.get("/admin/dispatch/batches/ready-orders")),

  /** GET /admin/dispatch/batches/suggestions */
  getBatchSuggestions: () =>
    unwrap(apiClient.get("/admin/dispatch/batches/suggestions")),

  /** GET /admin/dispatch/history */
  getHistory: (query: DispatchQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    return unwrap(apiClient.get(`/admin/dispatch/history?${params.toString()}`));
  },
};
