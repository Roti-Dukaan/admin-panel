import { apiClient } from "@/lib/api/http";
import type { PlanBuilderPayload } from "../types/plan-builder";
import type { SubscriptionPackage } from "../types/subscription-package";

export const planBuilderApi = {
  async create(payload: PlanBuilderPayload): Promise<SubscriptionPackage> {
    const { data } = await apiClient.post("/admin/subscription-packages/plan-builder", payload);
    return data.data ?? data;
  },

  async save(planId: string, payload: PlanBuilderPayload): Promise<SubscriptionPackage> {
    const { data } = await apiClient.patch(
      `/admin/subscription-packages/${planId}/plan-builder`,
      payload,
    );
    return data.data ?? data;
  },
};
