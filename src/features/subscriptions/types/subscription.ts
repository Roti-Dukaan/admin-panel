export type SubscriptionStatus =
  | "ACTIVE"
  | "PAUSED"
  | "ON_VACATION"
  | "CANCELLED"
  | "EXPIRED"
  | "FAILED";

export type SubscriptionFrequency = "DAILY" | "ALTERNATE" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export type SubscriptionOccurrenceStatus =
  | "SCHEDULED"
  | "PROCESSED"
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
  vacationStart: string | null;
  vacationEnd: string | null;
  nextOccurrenceDate: string | null;
  occurrencesGenerated: number;
  skippedCount: number;
  deliverySlotId: string | null;
  addressId: string | null;
  quantity: number;
  autoRenew: boolean;
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
  subscriptionsScanned: number;
  occurrencesPlanned: number;
  ordersCreated: number;
  ordersFailed: number;
  inventoryReserved: number;
  kitchenForecastId: string | null;
  deliveryForecastId: string | null;
  durationMs: number;
  errors: string[];
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
  SKIPPED: { label: "Skipped", variant: "secondary" },
  PAUSED: { label: "Paused", variant: "warning" },
  VACATION: { label: "Vacation", variant: "info" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  DAILY: "Daily",
  ALTERNATE: "Alternate Day",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  CUSTOM: "Custom",
};
