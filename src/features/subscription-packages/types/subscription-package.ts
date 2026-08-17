export type SubscriptionMenuCategory = "ROTI" | "CURRY" | "ADDON";
export type SubscriptionPlanType = "WEEKLY" | "MONTHLY";

export interface MenuCategoryDefinition {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  requiresRotiType: boolean;
  systemKey: string | null;
}

export interface PackageMenuItemLink {
  id: string;
  menuItemId: string;
  active: boolean;
  allowedDays: string[] | null;
  displayOrder: number;
  menuItem: {
    id: string;
    name: string;
    category: string;
    description?: string | null;
    image?: string | null;
    active: boolean;
  };
}

export interface PackageCategory {
  id: string;
  categoryDefinitionId: string;
  categoryDefinition?: MenuCategoryDefinition | null;
  categoryName?: string;
  categorySlug?: string | null;
  category: SubscriptionMenuCategory | null;
  categoryPrice: number;
  pricingPeriod: SubscriptionPlanType;
  active: boolean;
  includedQuantityPerDelivery: number;
  maximumQuantityPerDelivery: number;
  minimumSelection: number;
  maximumSelection: number | null;
  maximumChoicesPerDelivery: number | null;
  menuItems: PackageMenuItemLink[];
}

export interface SubscriptionPackage {
  id: string;
  packageId?: string;
  name: string;
  slug: string | null;
  description: string | null;
  type: SubscriptionPlanType;
  billingCycle: SubscriptionPlanType;
  active: boolean;
  isActive: boolean;
  displayOrder: number;
  validityDays: number;
  deliveriesPerCycle: number;
  hasCategoryPricing: boolean;
  catalogueCategoryPriceSum: number;
  priceLabel: string;
  availableDeliveryDays: string[] | null;
  availableDeliverySlots: string[] | null;
  selectionCutoffHours: number;
  allowCustomerCategorySelection?: boolean;
  branchId: string | null;
  categories: PackageCategory[];
  finalPrice?: number;
  originalPrice?: number;
  skipEnabled?: boolean;
  monthlySkipLimit?: number;
  weeklySkipLimit?: number;
  maxSkipDaysPerCycle?: number;
  skipCutoffHours?: number;
  discountType?: string;
  discountValue?: number;
  isDiscountActive?: boolean;
}

export interface PackageCategoryInput {
  categoryDefinitionId: string;
  categoryPrice: number;
  active?: boolean;
  includedQuantityPerDelivery?: number;
  maximumQuantityPerDelivery?: number;
  minimumSelection?: number;
  maximumSelection?: number | null;
  maximumChoicesPerDelivery?: number | null;
  menuItemIds?: string[];
}

export interface CreateSubscriptionPackageInput {
  name: string;
  slug?: string;
  description?: string;
  billingCycle: SubscriptionPlanType;
  validityDays: number;
  deliveriesPerCycle: number;
  active?: boolean;
  displayOrder?: number;
  branchId?: string;
  availableDeliveryDays?: string[];
  availableDeliverySlots?: string[];
  selectionCutoffHours?: number;
  allowCustomerCategorySelection?: boolean;
  skipEnabled?: boolean;
  monthlySkipLimit?: number;
  weeklySkipLimit?: number;
  maxSkipDaysPerCycle?: number;
  skipCutoffHours?: number;
  categories: PackageCategoryInput[];
}

export type UpdateSubscriptionPackageInput = Partial<CreateSubscriptionPackageInput>;

export const WEEKDAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
] as const;

export function pricePeriodLabel(cycle: SubscriptionPlanType): string {
  return cycle === "WEEKLY" ? "Price for full week" : "Price for full month";
}
