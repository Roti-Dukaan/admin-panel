import { apiClient } from "@/lib/api/http";
import {
  SubscriptionPlan,
  PlanStatus,
  MealType,
  PlanMenuItem,
} from "../types/subscription-plan";

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
const REV_DAY: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

function deriveFrequency(plan: SubscriptionPlan): {
  frequency: string;
  activeDays: number[];
} {
  const days = (plan.delivery?.deliveryDays ?? []).map((d) => DAY_MAP[d]).filter((n) => n !== undefined);
  const preset = plan.delivery?.dayPreset;
  if (preset === "everyday" || days.length >= 7) {
    return { frequency: "DAILY", activeDays: [0, 1, 2, 3, 4, 5, 6] };
  }
  if (preset === "weekends") {
    return { frequency: "CUSTOM_DAYS", activeDays: [0, 6] };
  }
  if (preset === "weekdays" || days.length >= 5) {
    return { frequency: "WEEKLY", activeDays: days };
  }
  return { frequency: "CUSTOM_DAYS", activeDays: days };
}

/** UI plan → backend create/update DTO (meals/pricing are JSON strings). */
export function planToBackendDto(plan: SubscriptionPlan): Record<string, any> {
  const { frequency, activeDays } = deriveFrequency(plan);
  const mealsJson = JSON.stringify({ slots: plan.meals?.mealsAvailable ?? ["lunch"] });
  const pricingJson = JSON.stringify(plan.pricing ?? {});
  const items = (plan.menuItems ?? []).map((m: PlanMenuItem, i: number) => ({
    foodItemId: m.foodItemId,
    mealSlot: m.mealSlot,
    isDefault: m.isDefault,
    sortOrder: i,
  }));

  // Persist the entire UI plan (benefits/rules/seo/menu) inside pricing so the
  // customer-facing view can reconstruct it. The essential scheduling fields
  // are also mapped to first-class backend columns above.
  const fullPlanJson = JSON.stringify({
    ...plan,
    meals: plan.meals,
    pricing: plan.pricing,
    menu: plan.menu,
    benefits: plan.benefits,
    rules: plan.rules,
    deliveryRules: plan.deliveryRules,
    seo: plan.seo,
    menuItems: plan.menuItems,
  });

  return {
    name: plan.name,
    slug: plan.slug || undefined,
    description: plan.longDescription || plan.shortDescription || plan.planBadge || undefined,
    frequency,
    activeDays,
    isFlexible: plan.rules?.renewalType === "automatic",
    minDurationDays: plan.rules?.minSubscriptionDays ?? null,
    maxDurationDays: null,
    meals: mealsJson,
    pricing: fullPlanJson,
    isActive: plan.status === "published",
    displayOrder: plan.displayOrder ?? 0,
    items: items.length ? items : undefined,
  };
}

/** Backend plan → UI plan. */
export function backendToPlan(p: any): SubscriptionPlan {
  const stored = typeof p.pricing === "string" ? safeParse(p.pricing) : p.pricing;
  const mealsJson = typeof p.meals === "string" ? safeParse(p.meals) : p.meals;
  const slots: MealType[] = mealsJson?.slots ?? stored?.meals?.mealsAvailable ?? ["lunch"];
  const activeDays: number[] = p.activeDays ?? [];
  const deliveryDays = activeDays.map((d) => REV_DAY[d]).filter(Boolean);

  const base: SubscriptionPlan = {
    id: p.id,
    name: p.name,
    slug: p.slug ?? "",
    shortDescription: stored?.shortDescription ?? p.description ?? "",
    longDescription: stored?.longDescription ?? p.description ?? "",
    planBadge: stored?.planBadge ?? "",
    displayOrder: p.displayOrder ?? 0,
    status: p.isActive ? ("published" as PlanStatus) : ("draft" as PlanStatus),
    isFeatured: stored?.isFeatured ?? false,
    pricing: stored?.pricing ?? defaultPricing(),
    meals: stored?.meals ?? {
      mealsAvailable: slots,
      dailyMealCount: slots.length,
      rotisPerMeal: 2,
      curriesIncluded: 1,
      extraCurryAllowed: false,
      extraRotiAllowed: false,
      maxRotisPerDay: 4,
    },
    delivery: stored?.delivery ?? {
      deliveryDays: deliveryDays.length ? deliveryDays : ["monday", "tuesday", "wednesday", "thursday", "friday"],
      dayPreset: activeDays.length >= 7 ? "everyday" : activeDays.length >= 5 ? "weekdays" : "custom",
      deliverySlots: slots as any,
    },
    menu: stored?.menu ?? {
      rotis: [],
      vegCurries: [],
      nonVeg: [],
      combos: [],
      maxRotis: 2,
      maxCurries: 1,
      dailyQuantityLimit: 1,
    },
    menuItems: (p.items ?? []).map((it: any) => ({
      foodItemId: it.foodItemId,
      name: it.foodItem?.name ?? it.name ?? "Item",
      mealSlot: (it.mealSlot as MealType) ?? "lunch",
      isDefault: it.isDefault ?? false,
    })),
    benefits: stored?.benefits ?? [],
    rules: stored?.rules ?? defaultRules(),
    deliveryRules: stored?.deliveryRules ?? defaultDeliveryRules(),
    seo: stored?.seo ?? { planUrl: "", metaTitle: "", metaDescription: "", ogImageUrl: "" },
    subscribers: p.subscribers ?? 0,
    createdAt: p.createdAt ? new Date(p.createdAt).getTime() : Date.now(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).getTime() : Date.now(),
  };
  return base;
}

function safeParse(v: any): any {
  if (typeof v !== "string") return v ?? {};
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
}
function defaultPricing() {
  return {
    weeklyPrice: 0,
    monthlyPrice: 0,
    quarterlyPrice: 0,
    yearlyPrice: 0,
    offerPrice: 0,
    gstPercent: 5,
    deliveryCharges: 0,
    freeDelivery: false,
    strikePrice: 0,
    currency: "INR",
  };
}
function defaultRules() {
  return {
    pauseAllowed: true,
    maxPauseDays: 7,
    pauseNoticeDays: 1,
    skipMealsAllowed: true,
    maxSkips: 3,
    carryForward: false,
    cancellationNoticeDays: 2,
    minSubscriptionDays: 7,
    renewalType: "automatic" as const,
  };
}
function defaultDeliveryRules() {
  return {
    supportedPincodes: [],
    maxDeliveriesPerSlot: 50,
    kitchenCapacity: 100,
    blackoutDates: [],
    holidayRules: "",
    deliveryChargeOverrides: "",
    minOrderDays: 7,
  };
}

export const plansApi = {
  async list(): Promise<SubscriptionPlan[]> {
    const { data } = await apiClient.get("/admin/subscriptions/plans/all");
    const items = data?.data ?? data ?? [];
    return (Array.isArray(items) ? items : []).map(backendToPlan);
  },
  async create(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
    const { data } = await apiClient.post("/admin/subscriptions/plans", planToBackendDto(plan));
    return backendToPlan(data?.data ?? data);
  },
  async update(id: string, plan: SubscriptionPlan): Promise<SubscriptionPlan> {
    const { data } = await apiClient.patch(`/admin/subscriptions/plans/${id}`, planToBackendDto(plan));
    return backendToPlan(data?.data ?? data);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/admin/subscriptions/plans/${id}`);
  },
  async setActive(id: string, isActive: boolean): Promise<SubscriptionPlan> {
    const { data } = await apiClient.patch(`/admin/subscriptions/plans/${id}`, { isActive });
    return backendToPlan(data?.data ?? data);
  },
};
