import type {
  SubscriptionProductionStatus,
  SubscriptionProductionItem,
  SubscriptionProduction,
  ProductionSummary,
  DaySummary,
  CookingSheet,
  CookingSheetItem,
  CookingSheetSubscription,
  ProductionQueryParams,
  UpdateProductionStatusDto,
  ProductionUpcomingItem,
} from '@/lib/api/subscription-production.api';

export type {
  SubscriptionProductionStatus,
  SubscriptionProductionItem,
  SubscriptionProduction,
  ProductionSummary,
  DaySummary,
  CookingSheet,
  CookingSheetItem,
  CookingSheetSubscription,
  ProductionQueryParams,
  UpdateProductionStatusDto,
  ProductionUpcomingItem,
};

export const PRODUCTION_STATUS_LABELS: Record<SubscriptionProductionStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
  CANCELLED: 'Cancelled',
};

export const PRODUCTION_STATUS_COLORS: Record<SubscriptionProductionStatus, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  SKIPPED: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export const DELIVERY_SLOT_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};