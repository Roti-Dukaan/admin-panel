export type SubscriptionStatus =
  | "ACTIVE"
  | "PAUSED"
  | "ON_VACATION"
  | "CANCELLED"
  | "EXPIRED"
  | "FAILED";

export type SubscriptionFrequency =
  | "DAILY"
  | "ALTERNATE_DAYS"
  | "WEEKLY"
  | "MONTHLY"
  | "CUSTOM_DAYS"
  | "FLEXIBLE";

export type SubscriptionOccurrenceStatus =
  | "SCHEDULED"
  | "PROCESSED"
  | "GENERATED"
  | "SKIPPED"
  | "PAUSED"
  | "VACATION"
  | "CANCELLED"
  | "FAILED";

export interface SubscriptionCustomer {
  id: string;
  fullName?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface SubscriptionAddress {
  id: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface SubscriptionDeliverySlot {
  id: string;
  name?: string;
  startTime?: string;
  endTime?: string;
}

export interface SubscriptionMeals {
  slots?: string[];
  [key: string]: unknown;
}

export interface SubscriptionEntity {
  id: string;
  customerId: string;
  planId: string | null;
  planName: string;
  frequency: SubscriptionFrequency;
  activeDays: number[];
  monthlyDays: number[];
  isFlexible: boolean;
  meals: SubscriptionMeals;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  pausedAt: string | null;
  pausedReason: string | null;
  resumeAt: string | null;
  resumedAt: string | null;
  totalPausedDays: number;
  vacationStart: string | null;
  vacationEnd: string | null;
  vacationReason: string | null;
  vacationDays: number;
  skippedDays: number;
  nextOccurrenceDate: string | null;
  nextGenerationDate: string | null;
  lastGeneratedDate: string | null;
  originalStartDate: string | null;
  originalEndDate: string | null;
  effectiveEndDate: string | null;
  pausedDays: number;
  occurrencesGenerated: number;
  skippedCount: number;
  deliverySlotId: string | null;
  addressId: string | null;
  quantity: number;
  autoRenew: boolean;
  billingStatus: string;
  notes: string | null;
  createdByAdminId: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: SubscriptionCustomer | null;
  address?: SubscriptionAddress | null;
  deliverySlot?: SubscriptionDeliverySlot | null;
}

export interface SubscriptionOccurrence {
  id: string;
  subscriptionId: string;
  occurrenceDate: string;
  mealSlot: string;
  status: SubscriptionOccurrenceStatus;
  addressId: string | null;
  deliverySlotId: string | null;
  items: Array<Record<string, unknown>>;
  quantity: number;
  priceSnapshot: Record<string, unknown> | null;
  orderId: string | null;
  deliveryId: string | null;
  reason: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionTimelineEntry {
  id: string;
  subscriptionId: string;
  event: string;
  occurrenceId: string | null;
  orderId: string | null;
  title: string;
  description: string | null;
  actorType: string;
  actorId: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  items?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubscriptionFilters {
  status: SubscriptionStatus | "all";
  search: string;
  frequency: SubscriptionFrequency | "all";
  page: number;
  limit: number;
}

export interface CreateSubscriptionAdminDto {
  customerId: string;
  planId?: string;
  startDate: string;
  deliveryAddressId: string;
  deliverySlotId: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  activeDays?: number[];
  monthlyDays?: number[];
  customDays?: number[];
  mealSelection?: string[];
  autoRenew?: boolean;
  paymentMethod?: "ONLINE" | "COD";
  notes?: string;
}

export interface SubscriptionAnalyticsOverview {
  totalActive: number;
  totalPaused: number;
  totalOnVacation: number;
  totalCancelled: number;
  totalFailed: number;
  totalSubscriptions: number;
  mrr: number;
  arr: number;
  activeCustomers: number;
  avgSubscriptionValue: number;
  churnRate: number;
  renewalRate: number;
  pausedRate: number;
  vacationRate: number;
  skipRate: number;
}

export interface SubscriptionGrowthPoint {
  date: string;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  netGrowth: number;
  totalActive: number;
}

export interface KitchenForecast {
  id?: string;
  forecastDate: string;
  totalOrders: number;
  totalQuantity: number;
  byMeal: Record<string, { orders: number; quantity: number }>;
  byItem: Array<{ foodItemId: string; name: string; quantity: number; orders: number }>;
  bySlot: Array<{ deliverySlotId: string; name: string; orders: number; quantity: number }>;
  estimatedPrepMinutes: number;
  confidence: number;
}

export interface DeliveryForecast {
  id?: string;
  forecastDate: string;
  totalDeliveries: number;
  bySlot: Array<{ deliverySlotId: string; name: string; deliveries: number; quantity: number }>;
  byZone: Array<{ zone: string; deliveries: number }>;
  estimatedRiders: number;
  estimatedDistanceKm: number;
  confidence: number;
}

export interface FulfillmentResult {
  targetDate: string;
  jobId: string;
  mealSlot?: string;
  subscriptionsScanned: number;
  occurrencesPlanned: number;
  ordersCreated: number;
  deliveriesCreated: number;
  skipped: number;
  failed: number;
}

export interface FulfillmentJob {
  id: string;
  targetDate: string;
  windowStart: string;
  windowEnd: string;
  status: string;
  subscriptionsScanned: number;
  occurrencesPlanned: number;
  ordersCreated: number;
  deliveriesCreated: number;
  skipped: number;
  failed: number;
  triggeredBy: string;
  startedAt: string;
  finishedAt: string | null;
}

export const SUBSCRIPTION_STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" | "pending" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  PAUSED: { label: "Paused", variant: "warning" },
  ON_VACATION: { label: "Vacation", variant: "info" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  EXPIRED: { label: "Expired", variant: "secondary" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export const OCCURRENCE_STATUS_CONFIG: Record<
  SubscriptionOccurrenceStatus,
  { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" | "pending" }
> = {
  SCHEDULED: { label: "Scheduled", variant: "pending" },
  PROCESSED: { label: "Processed", variant: "success" },
  GENERATED: { label: "Generated", variant: "info" },
  SKIPPED: { label: "Skipped", variant: "secondary" },
  PAUSED: { label: "Paused", variant: "warning" },
  VACATION: { label: "Vacation", variant: "info" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  DAILY: "Daily",
  ALTERNATE_DAYS: "Alternate Day",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  CUSTOM_DAYS: "Custom Days",
  FLEXIBLE: "Flexible",
};

// ── Subscription Operations Dashboard types ──
export interface SubscriptionOpsDashboard {
  total: number;
  active: number;
  paused: number;
  onVacation: number;
  cancelled: number;
  expired: number;
  expiringToday: number;
  expiringThisWeek: number;
  renewalsDue: number;
  todayOrders: number;
  tomorrowOrders: number;
  thisWeekForecast: {
    totalMeals: number;
    byDay: { date: string; totalMeals: number; expectedDeliveries: number; utilizationPct: number }[];
  };
}

export interface KitchenOpsForecast {
  date: string;
  totalMeals: number;
  mealsBySlot: Record<string, number>;
  expectedDeliveries: number;
  kitchenCapacity: number;
  utilizationPct: number;
  meals: {
    totalRotis: number;
    vegMeals: number;
    nonVegMeals: number;
    specialMeals: number;
    bySlot: Record<string, { total: number; veg: number; nonVeg: number; special: number; rotis: number }>;
  };
}

export interface DeliveryOpsForecast {
  date: string;
  totalDeliveries: number;
  byProvider: Record<string, number>;
  bySlot: Record<string, number>;
  byZone: Record<string, number>;
  byPincode: Record<string, number>;
  capacityPct: number;
}

export interface SubscriptionOpsCalendarDay {
  date: string;
  newSubscriptions: number;
  expiring: number;
  paused: number;
  vacation: number;
  renewals: number;
  skipped: number;
  kitchenLoad: number;
}

export interface SubscriptionOpsCalendar {
  year: number;
  month: number;
  days: SubscriptionOpsCalendarDay[];
}

export interface SubscriptionOpsAnalytics {
  growth: { date: string; count: number }[];
  cancellations: { date: string; count: number }[];
  pauseRate: number;
  vacationRate: number;
  churnRate: number;
  renewalRate: number;
  retentionRate: number;
  avgSubscriptionDurationDays: number;
  mealsDelivered: number;
  revenue: number;
}

export interface AdminAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  source?: string;
  refId?: string;
  isRead: boolean;
  isResolved: boolean;
  metadata?: any;
  createdAt: string;
  resolvedAt?: string;
}
