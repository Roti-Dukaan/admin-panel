import { apiClient } from "@/lib/api/http";
import { Coupon, CreateCouponInput, UpdateCouponInput } from "../types/coupon";

function normalizeCoupon(raw: Record<string, unknown>): Coupon {
  return {
    id: String(raw.id),
    code: String(raw.code),
    title: String(raw.title),
    description: (raw.description as string | null) ?? null,
    discountType: raw.discountType as Coupon["discountType"],
    discountValue: Number(raw.discountValue),
    minOrderValue: Number(raw.minOrderValue ?? 0),
    maxDiscountAmount: raw.maxDiscountAmount != null ? Number(raw.maxDiscountAmount) : null,
    totalUsageLimit: raw.totalUsageLimit != null ? Number(raw.totalUsageLimit) : null,
    perUserUsageLimit: raw.perUserUsageLimit != null ? Number(raw.perUserUsageLimit) : null,
    validFrom: String(raw.validFrom),
    validTill: String(raw.validTill),
    active: Boolean(raw.active),
    applicableOrderTypes: Array.isArray(raw.applicableOrderTypes)
      ? (raw.applicableOrderTypes as string[])
      : ["REALTIME_ONLY"],
    applicableBranchIds: Array.isArray(raw.applicableBranchIds)
      ? (raw.applicableBranchIds as string[])
      : null,
    firstOrderOnly: Boolean(raw.firstOrderOnly),
    autoApply: Boolean(raw.autoApply),
    usageCount: Number(raw.usageCount ?? 0),
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt),
  };
}

export const couponsApi = {
  async list(params?: { search?: string; active?: boolean }): Promise<Coupon[]> {
    const { data } = await apiClient.get("/admin/coupons", { params });
    const rows = (data?.data ?? []) as Record<string, unknown>[];
    return rows.map(normalizeCoupon);
  },

  async getById(id: string): Promise<Coupon> {
    const { data } = await apiClient.get(`/admin/coupons/${id}`);
    return normalizeCoupon((data?.data ?? data) as Record<string, unknown>);
  },

  async create(body: CreateCouponInput): Promise<Coupon> {
    const { data } = await apiClient.post("/admin/coupons", body);
    return normalizeCoupon((data?.data ?? data) as Record<string, unknown>);
  },

  async update(id: string, body: UpdateCouponInput): Promise<Coupon> {
    const { data } = await apiClient.patch(`/admin/coupons/${id}`, body);
    return normalizeCoupon((data?.data ?? data) as Record<string, unknown>);
  },

  async getUsage(id: string) {
    const { data } = await apiClient.get(`/admin/coupons/${id}/usage`);
    return data?.data ?? [];
  },
};
