import { apiClient } from "@/lib/api/http";
import type {
  MealSlotCatalogue,
  PlanMealBundle,
  PlanMealSlot,
  UpsertBundleInput,
  UpsertMealSlotInput,
} from "../types/meal-slot";

export const mealSlotsApi = {
  async catalogue(planId: string): Promise<MealSlotCatalogue> {
    const { data } = await apiClient.get(`/admin/subscription-packages/${planId}/meal-slots`);
    return (data?.data ?? { mealSlots: [], bundles: [] }) as MealSlotCatalogue;
  },

  async upsertMealSlot(planId: string, body: UpsertMealSlotInput): Promise<PlanMealSlot> {
    const { data } = await apiClient.post(`/admin/subscription-packages/${planId}/meal-slots`, body);
    return data?.data as PlanMealSlot;
  },

  async removeMealSlot(planId: string, mealSlotId: string): Promise<void> {
    await apiClient.delete(`/admin/subscription-packages/${planId}/meal-slots/${mealSlotId}`);
  },

  async upsertBundle(planId: string, body: UpsertBundleInput): Promise<PlanMealBundle> {
    const { data } = await apiClient.post(`/admin/subscription-packages/${planId}/meal-slots/bundles`, body);
    return data?.data as PlanMealBundle;
  },

  async removeBundle(planId: string, bundleId: string): Promise<void> {
    await apiClient.delete(`/admin/subscription-packages/${planId}/meal-slots/bundles/${bundleId}`);
  },
};
