export type SlotStatus = 'draft' | 'active' | 'disabled';
export type MealType = 'breakfast' | 'lunch' | 'evening' | 'dinner';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type DayPreset = 'everyday' | 'weekdays' | 'weekends' | 'custom';
export type SpecialDateType = 'holiday' | 'closed' | 'special-event' | 'festival' | 'maintenance';

export interface SpecialDate {
  id: string;
  date: string;
  type: SpecialDateType;
  label: string;
  slotsAffected: string[];
}

export interface DeliverySlotConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  mealType: MealType;
  displayOrder: number;
  status: SlotStatus;

  startTime: string;
  endTime: string;
  cutoffTime: string;
  estimatedDeliveryMinutes: number;
  preparationBufferMinutes: number;

  maxOrders: number;
  maxSubscriptionDeliveries: number;
  maxOneTimeOrders: number;
  maxMeals: number;
  kitchenCapacityWarningPercent: number;

  supportedPincodes: string[];
  deliveryFee: number;
  minimumOrderValue: number;
  allowCod: boolean;
  allowOnlinePayments: boolean;

  activeDays: DayOfWeek[];
  dayPreset: DayPreset;
  specialDates: SpecialDate[];

  currentBookings: number;
  todayBookings: number;
  createdAt: number;
  updatedAt: number;
}

export type DrawerMode = 'create' | 'edit' | 'view';

export const MEAL_TYPE_CONFIG: Record<MealType, { label: string; emoji: string; color: string; bgColor: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  lunch: { label: 'Lunch', emoji: '☀️', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  evening: { label: 'Evening Snacks', emoji: '🌆', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  dinner: { label: 'Dinner', emoji: '🌙', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
};

export const STATUS_CONFIG: Record<SlotStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100', dotColor: 'bg-gray-400' },
  active: { label: 'Active', color: 'text-emerald-700', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-500' },
  disabled: { label: 'Disabled', color: 'text-red-700', bgColor: 'bg-red-50', dotColor: 'bg-red-500' },
};

export const SPECIAL_DATE_TYPE_CONFIG: Record<SpecialDateType, { label: string; color: string; bgColor: string }> = {
  holiday: { label: 'Holiday', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  closed: { label: 'Closed', color: 'text-red-700', bgColor: 'bg-red-50' },
  'special-event': { label: 'Special Event', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  festival: { label: 'Festival', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  maintenance: { label: 'Maintenance', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export const ALL_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const ALL_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'evening', 'dinner'];
