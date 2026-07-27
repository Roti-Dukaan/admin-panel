import { apiClient } from "@/lib/api/http";
import type {
  SubscriptionOrderListResponse,
  SubscriptionOrderDetail,
  SubscriptionProductionSummary,
  MealSlot,
} from "../types/kitchen-subscriptions";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export interface SubscriptionKitchenQuery {
  mealSlot?: MealSlot;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const kitchenSubscriptionsApi = {
  /** GET /admin/kitchen/subscriptions — today's subscription orders */
  listOrders: (query: SubscriptionKitchenQuery = {}): Promise<SubscriptionOrderListResponse> => {
    const params = new URLSearchParams();
    if (query.mealSlot && query.mealSlot !== "all") params.append("mealSlot", query.mealSlot);
    if (query.status) params.append("status", query.status);
    if (query.search) params.append("search", query.search);
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);
    return unwrap(apiClient.get(`/admin/kitchen/subscriptions?${params.toString()}`));
  },

  /** GET /admin/kitchen/subscriptions/summary — production summary */
  getSummary: (): Promise<SubscriptionProductionSummary> =>
    unwrap(apiClient.get("/admin/kitchen/subscriptions/summary")),

  /** GET /admin/kitchen/subscriptions/:id — order detail */
  getOrderDetail: (id: string): Promise<SubscriptionOrderDetail> =>
    unwrap(apiClient.get(`/admin/kitchen/subscriptions/${id}`)),

  /** PATCH /admin/kitchen/subscriptions/:id/ready-for-dispatch — mark ready */
  markReadyForDispatch: (id: string, remark?: string): Promise<{ orderId: string; status: string; occurredAt: string }> =>
    unwrap(apiClient.patch(`/admin/kitchen/subscriptions/${id}/ready-for-dispatch`, { remark })),
};
