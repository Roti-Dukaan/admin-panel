import { apiClient } from "@/lib/api/http";
import {
  CreateSubscriptionPlanInput,
  parsePlanPrice,
  SubscriptionPlan,
  SubscriptionPlanItemRules,
  UpdateSubscriptionPlanInput,
} from "../types/subscription-plan";

interface RawSubscriptionPlan {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  type: SubscriptionPlan["type"];
  price: number | string;
  validityDays: number;
  deliveriesPerCycle: number;
  itemRules?: SubscriptionPlanItemRules | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

function normalizePlan(raw: RawSubscriptionPlan): SubscriptionPlan {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? null,
    description: raw.description ?? null,
    type: raw.type,
    price: parsePlanPrice(raw.price),
    validityDays: raw.validityDays,
    deliveriesPerCycle: raw.deliveriesPerCycle,
    itemRules: raw.itemRules ?? null,
    isActive: raw.isActive,
    displayOrder: raw.displayOrder,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const plansApi = {
  async list(): Promise<SubscriptionPlan[]> {
    const { data } = await apiClient.get("/admin/subscription-plans");
    const rows = (data?.data ?? []) as RawSubscriptionPlan[];
    return rows.map(normalizePlan);
  },

  async create(body: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    const { data } = await apiClient.post("/admin/subscription-plans", body);
    return normalizePlan((data?.data ?? data) as RawSubscriptionPlan);
  },

  async update(id: string, body: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    const { data } = await apiClient.patch(`/admin/subscription-plans/${id}`, body);
    return normalizePlan((data?.data ?? data) as RawSubscriptionPlan);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/admin/subscription-plans/${id}`);
  },
};

export const adminSubscriptionsApi = {
  async list(params?: Record<string, string>) {
    const { data } = await apiClient.get("/admin/subscriptions", { params });
    return data;
  },

  async getDeliveriesByDate(date: string, params?: Record<string, string>) {
    const { data } = await apiClient.get("/admin/subscriptions/deliveries", {
      params: { date, ...params },
    });
    return data?.data ?? [];
  },

  async getKitchenSummary(date: string, branchId?: string) {
    const { data } = await apiClient.get("/admin/subscriptions/kitchen/summary", {
      params: { date, branchId },
    });
    return data?.data;
  },

  async getPackingList(date: string, deliverySlotId: string, branchId?: string) {
    const { data } = await apiClient.get("/admin/subscriptions/kitchen/packing-list", {
      params: { date, deliverySlotId, branchId },
    });
    return data?.data ?? [];
  },

  async updateDeliveryStatus(deliveryId: string, status: string, notes?: string) {
    const { data } = await apiClient.patch(`/admin/subscriptions/deliveries/${deliveryId}/status`, {
      status,
      notes,
    });
    return data?.data;
  },
};
