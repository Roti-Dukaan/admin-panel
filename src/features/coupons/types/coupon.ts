export type CouponDiscountType = "FLAT" | "PERCENTAGE";

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  totalUsageLimit: number | null;
  perUserUsageLimit: number | null;
  validFrom: string;
  validTill: string;
  active: boolean;
  applicableOrderTypes: string[];
  applicableBranchIds: string[] | null;
  firstOrderOnly: boolean;
  autoApply: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CouponStatusFilter = "all" | "active" | "inactive";

export interface CreateCouponInput {
  code: string;
  title: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  totalUsageLimit?: number;
  perUserUsageLimit?: number;
  validFrom: string;
  validTill: string;
  active?: boolean;
  applicableBranchIds?: string[];
  firstOrderOnly?: boolean;
  autoApply?: boolean;
}

export type UpdateCouponInput = Partial<CreateCouponInput>;

export function formatCouponValue(coupon: Pick<Coupon, "discountType" | "discountValue">): string {
  return coupon.discountType === "FLAT"
    ? `₹${coupon.discountValue}`
    : `${coupon.discountValue}%`;
}
