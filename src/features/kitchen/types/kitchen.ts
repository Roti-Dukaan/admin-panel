export type OrderStatus = 'new' | 'preparing' | 'ready' | 'packed' | 'dispatched';

export type Priority = 'subscription' | 'express' | 'vip' | 'normal';

export type DeliverySlot = 'lunch' | 'dinner' | 'tomorrow';

export type PaymentMethod = 'cod' | 'online';

export type CookingPreference = 'regular' | 'extra-soft' | 'crispy' | 'well-cooked';

export interface OrderItem {
  name: string;
  quantity: number;
  emoji: string;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  status: OrderStatus;
  deliverySlot: DeliverySlot;
  priority: Priority;
  paymentMethod: PaymentMethod;
  cookingPreference: CookingPreference;
  specialInstructions: string[];
  preparationStartedAt: number | null;
  estimatedCompletionMinutes: number;
  createdAt: number;
  isSubscription: boolean;
  preparationNotes: string;
}

export interface ProductionItem {
  name: string;
  emoji: string;
  required: number;
  prepared: number;
}

export interface ProductionCategory {
  label: string;
  items: ProductionItem[];
}

export interface KitchenAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  message: string;
  timestamp: number;
}

export interface KitchenStats {
  pending: number;
  preparing: number;
  ready: number;
  packed: number;
  dispatched: number;
  delayed: number;
  avgPrepTime: number;
}

export interface KitchenFilters {
  priority: Priority[];
  deliverySlot: DeliverySlot[];
  paymentMethod: PaymentMethod[];
  search: string;
}

export const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; color: string; bgColor: string; borderColor: string }> = {
  new: { label: 'New Orders', emoji: '🆕', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  preparing: { label: 'Preparing', emoji: '👨‍🍳', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  ready: { label: 'Ready', emoji: '✅', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  packed: { label: 'Packed', emoji: '📦', color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
  dispatched: { label: 'Dispatched', emoji: '🚚', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string; textColor: string }> = {
  subscription: { label: 'Subscription', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  express: { label: 'Express', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  vip: { label: 'VIP', color: 'bg-violet-500', bgColor: 'bg-violet-50', textColor: 'text-violet-700' },
  normal: { label: 'Normal', color: 'bg-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
};

export const SLOT_CONFIG: Record<DeliverySlot, { label: string; time: string; emoji: string }> = {
  lunch: { label: 'Lunch', time: '12:00 PM – 2:00 PM', emoji: '☀️' },
  dinner: { label: 'Dinner', time: '7:00 PM – 9:00 PM', emoji: '🌙' },
  tomorrow: { label: 'Tomorrow', time: 'Scheduled', emoji: '📅' },
};

export const COLUMN_ORDER: OrderStatus[] = ['new', 'preparing', 'ready', 'packed', 'dispatched'];
