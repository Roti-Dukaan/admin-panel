import { apiClient } from "@/lib/api/http";
import type {
  SubscriptionKitchenSummary,
  SubscriptionPrepRow,
  SubscriptionDispatchRow,
} from "../types/kitchen-subscriptions";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export interface SubscriptionKitchenQuery {
  date: string;
  branchId?: string;
  slotId?: string;
  search?: string;
}

export const kitchenSubscriptionsApi = {
  getKitchenSummary: (query: Pick<SubscriptionKitchenQuery, "date" | "branchId">): Promise<SubscriptionKitchenSummary> =>
    unwrap(
      apiClient.get("/branch-manager/subscriptions/kitchen-summary", {
        params: { date: query.date, branchId: query.branchId },
      }),
    ),

  getPrepList: (query: SubscriptionKitchenQuery): Promise<SubscriptionPrepRow[]> =>
    unwrap(
      apiClient.get("/branch-manager/subscriptions/prep-list", {
        params: {
          date: query.date,
          branchId: query.branchId,
          slotId: query.slotId,
          search: query.search,
        },
      }),
    ),

  getDispatchReady: (query: Pick<SubscriptionKitchenQuery, "date" | "branchId">): Promise<SubscriptionDispatchRow[]> =>
    unwrap(
      apiClient.get("/branch-manager/subscriptions/dispatch-ready", {
        params: { date: query.date, branchId: query.branchId },
      }),
    ),

  markPrepStatus: (id: string, notes?: string) =>
    unwrap(apiClient.patch(`/branch-manager/subscriptions/prep-status/${id}`, { notes })),

  markPackingStatus: (id: string, notes?: string) =>
    unwrap(apiClient.patch(`/branch-manager/subscriptions/packing-status/${id}`, { notes })),

  markDispatchStatus: (id: string, notes?: string) =>
    unwrap(apiClient.patch(`/branch-manager/subscriptions/dispatch-status/${id}`, { notes })),
};
