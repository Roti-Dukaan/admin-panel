import { apiClient } from "@/lib/api/http";
import { Coupon, CreateCouponInput, UpdateCouponInput } from "../types/coupon";

function coerceNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function coerceIsoDate(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  }
  return String(value);
}

function normalizeCoupon(raw: Record<string, unknown>): Coupon {
  return {
    id: String(raw.id),
    code: String(raw.code),
    title: String(raw.title),
    description: (raw.description as string | null) ?? null,
    discountType: raw.discountType as Coupon["discountType"],
    discountValue: coerceNumber(raw.discountValue),
    minOrderValue: coerceNumber(raw.minOrderValue, 0),
    maxDiscountAmount: raw.maxDiscountAmount != null ? coerceNumber(raw.maxDiscountAmount) : null,
    totalUsageLimit: raw.totalUsageLimit != null ? coerceNumber(raw.totalUsageLimit) : null,
    perUserUsageLimit: raw.perUserUsageLimit != null ? coerceNumber(raw.perUserUsageLimit) : null,
    validFrom: coerceIsoDate(raw.validFrom),
    validTill: coerceIsoDate(raw.validTill),
    active: Boolean(raw.active),
    applicableOrderTypes: Array.isArray(raw.applicableOrderTypes)
      ? (raw.applicableOrderTypes as string[])
      : ["REALTIME_ONLY"],
    applicableBranchIds: Array.isArray(raw.applicableBranchIds)
      ? (raw.applicableBranchIds as string[])
      : null,
    firstOrderOnly: Boolean(raw.firstOrderOnly),
    autoApply: Boolean(raw.autoApply),
    usageCount: coerceNumber(raw.usageCount, 0),
    createdAt: coerceIsoDate(raw.createdAt),
    updatedAt: coerceIsoDate(raw.updatedAt),
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
