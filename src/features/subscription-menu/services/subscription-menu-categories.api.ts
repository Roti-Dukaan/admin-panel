import { apiClient } from "@/lib/api/http";

export interface MenuCategoryDefinition {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  requiresRotiType: boolean;
  systemKey: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuCategoryInput {
  name: string;
  slug?: string;
  sortOrder?: number;
  active?: boolean;
  requiresRotiType?: boolean;
}

export type UpdateMenuCategoryInput = Partial<CreateMenuCategoryInput>;

export const subscriptionMenuCategoriesApi = {
  async list(activeOnly = false): Promise<MenuCategoryDefinition[]> {
    const { data } = await apiClient.get("/admin/subscription-menu-categories", {
      params: activeOnly ? { activeOnly: "true" } : undefined,
    });
    return (data?.data ?? []) as MenuCategoryDefinition[];
  },

  async create(input: CreateMenuCategoryInput): Promise<MenuCategoryDefinition> {
    const { data } = await apiClient.post("/admin/subscription-menu-categories", input);
    return data?.data as MenuCategoryDefinition;
  },

  async update(id: string, input: UpdateMenuCategoryInput): Promise<MenuCategoryDefinition> {
    const { data } = await apiClient.patch(`/admin/subscription-menu-categories/${id}`, input);
    return data?.data as MenuCategoryDefinition;
  },

  async remove(id: string): Promise<MenuCategoryDefinition> {
    const { data } = await apiClient.delete(`/admin/subscription-menu-categories/${id}`);
    return data?.data as MenuCategoryDefinition;
  },
};
