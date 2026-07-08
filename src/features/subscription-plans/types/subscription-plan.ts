export type PlanStatus = 'draft' | 'published' | 'archived';
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type RenewalType = 'automatic' | 'manual';
export type DeliveryDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type DeliverySlot = 'breakfast' | 'lunch' | 'evening' | 'dinner';
export type DayPreset = 'weekdays' | 'weekends' | 'everyday' | 'custom';

export interface PlanPricing {
  weeklyPrice: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  offerPrice: number;
  gstPercent: number;
  deliveryCharges: number;
  freeDelivery: boolean;
  strikePrice: number;
  currency: string;
}

export interface MealConfiguration {
  mealsAvailable: MealType[];
  dailyMealCount: number;
  rotisPerMeal: number;
  curriesIncluded: number;
  extraCurryAllowed: boolean;
  extraRotiAllowed: boolean;
  maxRotisPerDay: number;
}

export interface DeliverySchedule {
  deliveryDays: DeliveryDay[];
  dayPreset: DayPreset;
  deliverySlots: DeliverySlot[];
}

export interface MenuInclusion {
  rotis: string[];
  vegCurries: string[];
  nonVeg: string[];
  combos: string[];
  maxRotis: number;
  maxCurries: number;
  dailyQuantityLimit: number;
}

export interface PlanBenefit {
  id: string;
  text: string;
  icon?: string;
  order: number;
}

export interface PlanRules {
  pauseAllowed: boolean;
  maxPauseDays: number;
  pauseNoticeDays: number;
  skipMealsAllowed: boolean;
  maxSkips: number;
  carryForward: boolean;
  cancellationNoticeDays: number;
  minSubscriptionDays: number;
  renewalType: RenewalType;
}

export interface DeliveryRules {
  supportedPincodes: string[];
  maxDeliveriesPerSlot: number;
  kitchenCapacity: number;
  blackoutDates: string[];
  holidayRules: string;
  deliveryChargeOverrides: string;
  minOrderDays: number;
}

export interface SeoConfig {
  planUrl: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  planBadge: string;
  displayOrder: number;
  status: PlanStatus;
  isFeatured: boolean;
  pricing: PlanPricing;
  meals: MealConfiguration;
  delivery: DeliverySchedule;
  menu: MenuInclusion;
  benefits: PlanBenefit[];
  rules: PlanRules;
  deliveryRules: DeliveryRules;
  seo: SeoConfig;
  subscribers: number;
  createdAt: number;
  updatedAt: number;
}

export type PlanTab = 'general' | 'pricing' | 'meals' | 'delivery' | 'menu' | 'benefits' | 'rules' | 'delivery-rules' | 'preview' | 'seo';

export const PLAN_TABS: { key: PlanTab; label: string; icon: string }[] = [
  { key: 'general', label: 'General', icon: 'Info' },
  { key: 'pricing', label: 'Pricing', icon: 'IndianRupee' },
  { key: 'meals', label: 'Meals', icon: 'UtensilsCrossed' },
  { key: 'delivery', label: 'Delivery Schedule', icon: 'Calendar' },
  { key: 'menu', label: 'Menu Included', icon: 'ListChecks' },
  { key: 'benefits', label: 'Benefits', icon: 'Sparkles' },
  { key: 'rules', label: 'Plan Rules', icon: 'Shield' },
  { key: 'delivery-rules', label: 'Delivery Rules', icon: 'Truck' },
  { key: 'preview', label: 'Website Preview', icon: 'Eye' },
  { key: 'seo', label: 'SEO', icon: 'Search' },
];

export const PLAN_BADGE_OPTIONS = [
  'Best Seller',
  'Most Popular',
  'Healthy Choice',
  'Family Pack',
  'New',
  'Premium',
  'Budget Friendly',
  'Corporate',
  'Weight Loss',
  'High Protein',
];

export const ALL_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];
export const ALL_DELIVERY_DAYS: DeliveryDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const ALL_DELIVERY_SLOTS: { key: DeliverySlot; label: string; time: string }[] = [
  { key: 'breakfast', label: 'Breakfast', time: '7:00 AM - 9:00 AM' },
  { key: 'lunch', label: 'Lunch', time: '12:00 PM - 2:00 PM' },
  { key: 'evening', label: 'Evening', time: '4:00 PM - 6:00 PM' },
  { key: 'dinner', label: 'Dinner', time: '7:00 PM - 9:00 PM' },
];

export const STATUS_CONFIG: Record<PlanStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100', dotColor: 'bg-gray-400' },
  published: { label: 'Published', color: 'text-emerald-700', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-500' },
  archived: { label: 'Archived', color: 'text-amber-700', bgColor: 'bg-amber-50', dotColor: 'bg-amber-500' },
};
