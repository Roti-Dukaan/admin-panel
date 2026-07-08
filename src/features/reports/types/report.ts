export type DateRange = 'today' | 'yesterday' | '7d' | '30d' | 'this-month' | 'custom';
export type ChartGranularity = 'daily' | 'weekly' | 'monthly';
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export interface DateRangeOption {
  key: DateRange;
  label: string;
}

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: 'this-month', label: 'This Month' },
  { key: 'custom', label: 'Custom Range' },
];

export interface KpiCard {
  key: string;
  label: string;
  value: number;
  previousValue: number;
  format: 'currency' | 'number' | 'percent' | 'decimal';
  icon: string;
  color: string;
  bgColor: string;
}

export interface RevenueDataPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface OrderAnalytics {
  completed: number;
  cancelled: number;
  pending: number;
  avgPrepTime: number;
  avgDeliveryTime: number;
  totalOrders: number;
}

export interface MenuItemPerformance {
  id: string;
  name: string;
  category: string;
  orders: number;
  revenue: number;
  trend: number;
  image: string;
}

export interface SubscriptionInsightData {
  activePlans: number;
  weeklySubscribers: number;
  monthlySubscribers: number;
  mostPopularPlan: string;
  subscriptionRevenue: number;
  renewals: number;
  churnRate: number;
}

export interface DeliveryAnalyticsData {
  lunchOrders: number;
  dinnerOrders: number;
  breakfastOrders: number;
  eveningOrders: number;
  avgDeliveryTime: number;
  peakDeliverySlot: string;
  pincodeDistribution: { pincode: string; orders: number; percentage: number }[];
}

export interface PaymentAnalyticsData {
  cod: number;
  online: number;
  pending: number;
  failed: number;
  refunded: number;
  total: number;
}

export interface CustomerInsightData {
  repeatCustomers: number;
  firstTimeCustomers: number;
  customerRetention: number;
  topSpendingCustomers: { name: string; spend: number; orders: number }[];
  avgOrdersPerCustomer: number;
  totalCustomers: number;
}

export interface BestSellingItem {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  image: string;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'registration' | 'subscription' | 'payment';
  title: string;
  description: string;
  amount?: number;
  timestamp: number;
}

export interface ReportsData {
  kpis: KpiCard[];
  revenueChart: RevenueDataPoint[];
  orderAnalytics: OrderAnalytics;
  menuPerformance: MenuItemPerformance[];
  subscriptionInsights: SubscriptionInsightData;
  deliveryAnalytics: DeliveryAnalyticsData;
  paymentAnalytics: PaymentAnalyticsData;
  customerInsights: CustomerInsightData;
  bestSellingItems: BestSellingItem[];
  recentActivity: ActivityItem[];
  popularSlots: { slot: string; orders: number; color: string }[];
}
