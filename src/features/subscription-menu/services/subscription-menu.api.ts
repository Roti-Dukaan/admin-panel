import { apiClient } from "@/lib/api/http";
import type { PlanMenuLink, SubscriptionMenuItem, SubscriptionMenuItemForm } from "../types/subscription-menu";

export const subscriptionMenuApi = {
  async list(activeOnly = false): Promise<SubscriptionMenuItem[]> {
    const { data } = await apiClient.get("/admin/subscription-menu-items", {
      params: activeOnly ? { activeOnly: "true" } : undefined,
    });
    return (data?.data ?? []) as SubscriptionMenuItem[];
  },

  async getById(id: string): Promise<SubscriptionMenuItem> {
    const { data } = await apiClient.get(`/admin/subscription-menu-items/${id}`);
    return data?.data as SubscriptionMenuItem;
  },

  async create(payload: SubscriptionMenuItemForm): Promise<SubscriptionMenuItem> {
    const { data } = await apiClient.post("/admin/subscription-menu-items", payload);
    return data?.data as SubscriptionMenuItem;
  },

  async update(id: string, payload: Partial<SubscriptionMenuItemForm>): Promise<SubscriptionMenuItem> {
    const { data } = await apiClient.patch(`/admin/subscription-menu-items/${id}`, payload);
    return data?.data as SubscriptionMenuItem;
  },

  async remove(id: string): Promise<SubscriptionMenuItem> {
    const { data } = await apiClient.delete(`/admin/subscription-menu-items/${id}`);
    return data?.data as SubscriptionMenuItem;
  },

  async listPlanItems(planId: string): Promise<PlanMenuLink[]> {
    const { data } = await apiClient.get(`/admin/subscription-plans/${planId}/menu-items`);
    return (data?.data ?? []) as PlanMenuLink[];
  },

  async attachToPlan(planId: string, subscriptionMenuItemIds: string[]): Promise<PlanMenuLink[]> {
    const { data } = await apiClient.post(`/admin/subscription-plans/${planId}/menu-items`, {
      subscriptionMenuItemIds,
    });
    return (data?.data ?? []) as PlanMenuLink[];
  },

  async detachFromPlan(planId: string, menuItemId: string): Promise<PlanMenuLink[]> {
    const { data } = await apiClient.delete(
      `/admin/subscription-plans/${planId}/menu-items/${menuItemId}`,
    );
    return (data?.data ?? []) as PlanMenuLink[];
  },

  async updatePlanLink(
    planId: string,
    menuItemId: string,
    payload: { sortOrder?: number; isDefault?: boolean; maxQtyPerDelivery?: number | null },
  ): Promise<PlanMenuLink[]> {
    const { data } = await apiClient.patch(
      `/admin/subscription-plans/${planId}/menu-items/${menuItemId}`,
      payload,
    );
    return (data?.data ?? []) as PlanMenuLink[];
  },
};
