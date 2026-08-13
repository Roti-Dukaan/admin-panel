import { apiClient } from "@/lib/api/http";
import type {
  CreateSubscriptionPackageInput,
  SubscriptionPackage,
  UpdateSubscriptionPackageInput,
} from "../types/subscription-package";

export const packagesApi = {
  async list(): Promise<SubscriptionPackage[]> {
    const { data } = await apiClient.get("/admin/subscription-packages");
    return (data?.data ?? []) as SubscriptionPackage[];
  },

  async getById(id: string): Promise<SubscriptionPackage> {
    const { data } = await apiClient.get(`/admin/subscription-packages/${id}`);
    return data?.data as SubscriptionPackage;
  },

  async create(body: CreateSubscriptionPackageInput): Promise<SubscriptionPackage> {
    const { data } = await apiClient.post("/admin/subscription-packages", body);
    return data?.data as SubscriptionPackage;
  },

  async update(id: string, body: UpdateSubscriptionPackageInput): Promise<SubscriptionPackage> {
    const { data } = await apiClient.patch(`/admin/subscription-packages/${id}`, body);
    return data?.data as SubscriptionPackage;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/admin/subscription-packages/${id}`);
  },
};
