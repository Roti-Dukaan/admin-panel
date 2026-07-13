import { ReportsData, RevenueDataPoint } from '../types/report';

const now = Date.now();

export const mockReportsData: ReportsData = {
  kpis: [],
  revenueChart: [],
  orderAnalytics: {
    completed: 0,
    cancelled: 0,
    pending: 0,
    avgPrepTime: 0,
    avgDeliveryTime: 0,
    totalOrders: 0,
  },
  menuPerformance: [],
  subscriptionInsights: {
    activePlans: 0,
    weeklySubscribers: 0,
    monthlySubscribers: 0,
    mostPopularPlan: '',
    subscriptionRevenue: 0,
    renewals: 0,
    churnRate: 0,
  },
  deliveryAnalytics: {
    lunchOrders: 0,
    dinnerOrders: 0,
    breakfastOrders: 0,
    eveningOrders: 0,
    avgDeliveryTime: 0,
    peakDeliverySlot: '',
    pincodeDistribution: [],
  },
  paymentAnalytics: {
    cod: 0,
    online: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    total: 0,
  },
  customerInsights: {
    repeatCustomers: 0,
    firstTimeCustomers: 0,
    customerRetention: 0,
    topSpendingCustomers: [],
    avgOrdersPerCustomer: 0,
    totalCustomers: 0,
  },
  popularSlots: [],
  bestSellingItems: [],
  recentActivity: [],
};

export const mockDailyData: RevenueDataPoint[] = [];
export const mockWeeklyData: RevenueDataPoint[] = [];
export const mockMonthlyData: RevenueDataPoint[] = [];