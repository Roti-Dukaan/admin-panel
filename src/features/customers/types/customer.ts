export type CustomerStatus = 'active' | 'inactive';

export type SubscriptionPlan = 'starter' | 'family' | 'premium';

export type PaymentMethod = 'cod' | 'online';

export type OrderStatus = 'placed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';

export interface CustomerAddress {
  id: string;
  label: 'home' | 'office' | 'other';
  line1: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CustomerOrder {
  id: string;
  orderId: string;
  date: number;
  items: { name: string; quantity: number }[];
  deliverySlot: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  amount: number;
}

export interface CustomerSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'paused' | 'cancelled';
  startedOn: number;
  renewalDate: number;
  dailyQuantity: number;
  deliverySlot: string;
}

export interface CustomerPayment {
  id: string;
  date: number;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'success' | 'pending' | 'failed';
}

export interface CustomerInsights {
  favouriteRoti: string;
  favouriteCurry: string;
  favouriteCombo: string;
  preferredDeliverySlot: string;
  preferredPaymentMethod: PaymentMethod;
  mostOrderedMeal: string;
  averageMonthlySpend: number;
}

export interface CustomerTimelineEvent {
  id: string;
  type: 'created' | 'address-added' | 'first-order' | 'subscription-started' | 'latest-order' | 'latest-login';
  label: string;
  date: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  registeredAt: number;
  lastLogin: number;
  status: CustomerStatus;
  isSubscriber: boolean;
  isRepeatCustomer: boolean;
  isVip: boolean;
  pincode: string;
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
  subscription: CustomerSubscription | null;
  payments: CustomerPayment[];
  insights: CustomerInsights;
  timeline: CustomerTimelineEvent[];
}

export interface CustomerFilters {
  search: string;
  subscription: 'all' | 'subscribed' | 'not-subscribed';
  status: CustomerStatus | 'all';
  pincode: string;
  paymentPreference: 'all' | PaymentMethod;
}

export const SUBSCRIPTION_PLAN_CONFIG: Record<SubscriptionPlan, { label: string; color: string; bgColor: string }> = {
  starter: { label: 'Starter', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  family: { label: 'Family', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  premium: { label: 'Premium', color: 'text-violet-700', bgColor: 'bg-violet-50' },
};

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  placed: { label: 'Placed', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  preparing: { label: 'Preparing', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  'out-for-delivery': { label: 'Out for Delivery', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  delivered: { label: 'Delivered', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-50' },
};
