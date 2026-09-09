import { apiClient } from "@/lib/api/http";
import { todayDateKey } from "@/lib/date";

export const SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "PENDING",
  "PAUSED",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type SubscriptionStatusKey = (typeof SUBSCRIPTION_STATUSES)[number];

export interface KitchenItemTotal {
  subscriptionMenuItemId: string;
  name: string;
  rotiType?: string | null;
  quantity: number;
}

export interface SubscriptionKitchenSummary {
  totalDeliveries: number;
  totalCustomers: number;
  totalRotis: number;
  totalPacks: number;
  statusCounts: {
    pending: number;
    preparing: number;
    packed: number;
    readyForDispatch: number;
  };
  itemTotals: KitchenItemTotal[];
}

export interface SubscriptionDeliveryDashboard {
  pendingPrep: number;
  assigned: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
  cancelledSkipped: number;
}

export interface SubscriptionOverview {
  date: string;
  statusCounts: Record<SubscriptionStatusKey, number>;
  totalSubscriptions: number;
  kitchen: SubscriptionKitchenSummary | null;
  delivery: SubscriptionDeliveryDashboard | null;
}

/**
 * The list endpoint has no aggregate counts, so each status is fetched with
 * limit=1 and only the `total` is used.
 */
async function countByStatus(status: SubscriptionStatusKey): Promise<number> {
  const { data } = await apiClient.get("/admin/subscriptions", {
    params: { status, page: "1", limit: "1" },
  });
  return Number(data?.total ?? 0);
}

export const subscriptionOverviewApi = {
  async get(date?: string): Promise<SubscriptionOverview> {
    const target = date ?? todayDateKey();

    const counts = await Promise.all(
      SUBSCRIPTION_STATUSES.map((status) => countByStatus(status).catch(() => 0)),
    );

    const statusCounts = SUBSCRIPTION_STATUSES.reduce(
      (acc, status, index) => {
        acc[status] = counts[index];
        return acc;
      },
      {} as Record<SubscriptionStatusKey, number>,
    );

    const [kitchen, delivery] = await Promise.all([
      apiClient
        .get("/admin/subscriptions/kitchen/summary", { params: { date: target } })
        .then((res) => (res.data?.data ?? null) as SubscriptionKitchenSummary | null)
        .catch(() => null),
      apiClient
        .get("/admin/subscriptions/kitchen/delivery-dashboard", { params: { date: target } })
        .then((res) => (res.data?.data ?? null) as SubscriptionDeliveryDashboard | null)
        .catch(() => null),
    ]);

    return {
      date: target,
      statusCounts,
      totalSubscriptions: counts.reduce((sum, n) => sum + n, 0),
      kitchen,
      delivery,
    };
  },
};
