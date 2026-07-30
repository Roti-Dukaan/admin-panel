import { apiClient } from "@/lib/api/http";
import type {
  SubscriptionKitchenSummary,
  SubscriptionPrepRow,
  SubscriptionDispatchRow,
  SubscriptionDeliveryDashboard,
} from "../types/kitchen-subscriptions";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export interface SubscriptionKitchenQuery {
  date: string;
  branchId?: string;
  slotId?: string;
  search?: string;
  includeCompleted?: boolean;
}

export type SubscriptionKitchenApiScope = "branch" | "admin";

function kitchenBasePath(scope: SubscriptionKitchenApiScope): string {
  return scope === "admin" ? "/admin/subscriptions" : "/branch-manager/subscriptions";
}

export const kitchenSubscriptionsApi = {
  getKitchenSummary: (
    query: Pick<SubscriptionKitchenQuery, "date" | "branchId">,
    scope: SubscriptionKitchenApiScope = "branch",
  ): Promise<SubscriptionKitchenSummary> =>
    unwrap(
      apiClient.get(
        scope === "admin"
          ? `${kitchenBasePath(scope)}/kitchen/summary`
          : `${kitchenBasePath(scope)}/kitchen-summary`,
        {
          params: { date: query.date, branchId: query.branchId },
        },
      ),
    ),

  getPrepList: (
    query: SubscriptionKitchenQuery,
    scope: SubscriptionKitchenApiScope = "branch",
  ): Promise<SubscriptionPrepRow[]> =>
    unwrap(
      apiClient.get(
        scope === "admin"
          ? `${kitchenBasePath(scope)}/kitchen/prep-list`
          : `${kitchenBasePath(scope)}/prep-list`,
        {
          params: {
            date: query.date,
            branchId: query.branchId,
            slotId: query.slotId,
            search: query.search,
            includeCompleted: query.includeCompleted,
          },
        },
      ),
    ),

  getDeliveryDashboard: (
    query: SubscriptionKitchenQuery,
    scope: SubscriptionKitchenApiScope = "branch",
  ): Promise<SubscriptionDeliveryDashboard> =>
    unwrap(
      apiClient.get(
        scope === "admin"
          ? `${kitchenBasePath(scope)}/kitchen/delivery-dashboard`
          : `${kitchenBasePath(scope)}/delivery-dashboard`,
        {
          params: {
            date: query.date,
            branchId: query.branchId,
            slotId: query.slotId,
            search: query.search,
          },
        },
      ),
    ),

  getDispatchReady: (
    query: Pick<SubscriptionKitchenQuery, "date" | "branchId">,
    scope: SubscriptionKitchenApiScope = "branch",
  ): Promise<SubscriptionDispatchRow[]> =>
    unwrap(
      apiClient.get(`${kitchenBasePath(scope)}/dispatch-ready`, {
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
