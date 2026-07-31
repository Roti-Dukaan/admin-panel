export type SubscriptionPlanType = "WEEKLY" | "MONTHLY";
export type PlanDiscountType = "FLAT" | "PERCENTAGE" | "NONE";
export type CarryForwardMode = "EXTEND_END_DATE" | "CREDIT_BALANCE";

export type PlanStatusFilter = "all" | "active" | "inactive";

export interface SubscriptionPlanItemRules {
  rotisPerDelivery?: number;
  maxItems?: number;
  allowedFoodItemIds?: string[];
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  type: SubscriptionPlanType;
  billingCycle: SubscriptionPlanType;
  price: number;
  originalPrice: number;
  finalPrice: number;
  savingsAmount: number;
  discountType: PlanDiscountType;
  discountValue: number;
  discountLabel: string | null;
  isDiscountActive: boolean;
  validityDays: number;
  deliveriesPerCycle: number;
  itemRules: SubscriptionPlanItemRules | null;
  isActive: boolean;
  displayOrder: number;
  badge: string | null;
  skipEnabled: boolean;
  monthlySkipLimit: number;
  weeklySkipLimit: number;
  maxSkipDaysPerCycle: number;
  skipCutoffHours: number;
  carryForwardEnabled: boolean;
  carryForwardMode: CarryForwardMode;
  allowAdminOverride: boolean;
  skipLimitDisplay: string;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  razorpayPlanId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanInput {
  name: string;
  slug?: string;
  description?: string;
  type: SubscriptionPlanType;
  price: number;
  validityDays: number;
  deliveriesPerCycle: number;
  itemRules?: SubscriptionPlanItemRules | null;
  isActive?: boolean;
  displayOrder?: number;
  badge?: string;
  skipEnabled?: boolean;
  monthlySkipLimit?: number;
  weeklySkipLimit?: number;
  maxSkipDaysPerCycle?: number;
  skipCutoffHours?: number;
  carryForwardEnabled?: boolean;
  carryForwardMode?: CarryForwardMode;
  allowAdminOverride?: boolean;
  discountType?: PlanDiscountType;
  discountValue?: number;
  discountLabel?: string;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscountActive?: boolean;
}

export type UpdateSubscriptionPlanInput = Partial<CreateSubscriptionPlanInput>;

export const PLAN_TYPE_LABELS: Record<SubscriptionPlanType, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

export const DISCOUNT_TYPE_LABELS: Record<PlanDiscountType, string> = {
  FLAT: "Flat (₹)",
  PERCENTAGE: "Percentage (%)",
  NONE: "No discount",
};

export const CARRY_FORWARD_LABELS: Record<CarryForwardMode, string> = {
  EXTEND_END_DATE: "Extend end date",
  CREDIT_BALANCE: "Credit balance",
};

export const ACTIVE_STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    dotColor: "bg-emerald-500",
  },
  inactive: {
    label: "Inactive",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    dotColor: "bg-gray-400",
  },
} as const;

export function parsePlanPrice(price: number | string): number {
  if (typeof price === "number") return price;
  const parsed = parseFloat(price);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPlanPrice(price: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parsePlanPrice(price));
}

export function formatPlanDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Client-side preview mirroring backend pricing logic. */
export function previewFinalPrice(
  basePrice: number,
  discountType: PlanDiscountType,
  discountValue: number,
  isDiscountActive: boolean,
): { finalPrice: number; savingsAmount: number } {
  if (!isDiscountActive || discountType === "NONE") {
    return { finalPrice: basePrice, savingsAmount: 0 };
  }
  let finalPrice = basePrice;
  if (discountType === "FLAT") {
    finalPrice = Math.max(0, basePrice - discountValue);
  } else if (discountType === "PERCENTAGE") {
    finalPrice = Math.max(0, basePrice * (1 - discountValue / 100));
  }
  finalPrice = Math.round(finalPrice * 100) / 100;
  return { finalPrice, savingsAmount: Math.round((basePrice - finalPrice) * 100) / 100 };
}

export const EMPTY_PLAN: CreateSubscriptionPlanInput = {
  name: "",
  slug: "",
  description: "",
  type: "MONTHLY",
  price: 0,
  validityDays: 30,
  deliveriesPerCycle: 26,
  itemRules: { rotisPerDelivery: 6, maxItems: 3 },
  isActive: true,
  displayOrder: 0,
  badge: "",
  skipEnabled: true,
  monthlySkipLimit: 2,
  weeklySkipLimit: 1,
  maxSkipDaysPerCycle: 2,
  skipCutoffHours: 12,
  carryForwardEnabled: false,
  carryForwardMode: "EXTEND_END_DATE",
  allowAdminOverride: true,
  discountType: "NONE",
  discountValue: 0,
  discountLabel: "",
  isDiscountActive: false,
};
