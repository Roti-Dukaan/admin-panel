import { ReportsData, RevenueDataPoint } from '../types/report';

const now = Date.now();

export const mockReportsData: ReportsData = {
  kpis: [],
  revenueChart: [],
  orderAnalytics: {
    completed: 120,
    cancelled: 8,
    pending: 25,
    avgPrepTime: 22,
    avgDeliveryTime: 35,
    totalOrders: 153,
  },
  menuPerformance: [
    { id: '1', name: 'Butter Chicken', category: 'Main Course', orders: 45, revenue: 22500, trend: 12, image: '' },
    { id: '2', name: 'Dal Makhani', category: 'Main Course', orders: 38, revenue: 15200, trend: 8, image: '' },
    { id: '3', name: 'Garlic Naan', category: 'Breads', orders: 67, revenue: 8040, trend: 15, image: '' },
  ],
  subscriptionInsights: {
    activePlans: 3,
    weeklySubscribers: 45,
    monthlySubscribers: 120,
    mostPopularPlan: 'Monthly Premium',
    subscriptionRevenue: 450000,
    renewals: 89,
    churnRate: 3.2,
  },
  deliveryAnalytics: {
    lunchOrders: 85,
    dinnerOrders: 142,
    breakfastOrders: 35,
    eveningOrders: 28,
    avgDeliveryTime: 28,
    peakDeliverySlot: '7:00 PM - 9:00 PM',
    pincodeDistribution: [
      { pincode: '110001', orders: 45, percentage: 29.4 },
      { pincode: '110002', orders: 32, percentage: 20.9 },
      { pincode: '110003', orders: 28, percentage: 18.3 },
    ],
  },
  paymentAnalytics: {
    cod: 45000,
    online: 125000,
    pending: 8000,
    failed: 2500,
    refunded: 3200,
    total: 172500,
    // COD-specific metrics
    codPendingCollection: 35000,
    codCollected: 10000,
    codSettled: 8500,
    codOrders: 65,
    onlineOrders: 88,
    pendingCollectionAmount: 35000,
  },
  customerInsights: {
    repeatCustomers: 180,
    firstTimeCustomers: 45,
    customerRetention: 72.5,
    topSpendingCustomers: [
      { name: 'Rajesh Kumar', spend: 12500, orders: 18 },
      { name: 'Priya Sharma', spend: 9800, orders: 14 },
      { name: 'Amit Singh', spend: 8200, orders: 12 },
    ],
    avgOrdersPerCustomer: 2.3,
    totalCustomers: 225,
  },
  popularSlots: [
    { slot: '7:00 PM - 9:00 PM', orders: 52, color: '#22c55e' },
    { slot: '12:00 PM - 2:00 PM', orders: 48, color: '#3b82f6' },
    { slot: '5:00 PM - 7:00 PM', orders: 35, color: '#f59e0b' },
  ],
  bestSellingItems: [
    { id: '1', name: 'Butter Chicken', category: 'Main Course', quantitySold: 45, revenue: 22500, image: '' },
    { id: '2', name: 'Dal Makhani', category: 'Main Course', quantitySold: 38, revenue: 15200, image: '' },
    { id: '3', name: 'Garlic Naan', category: 'Breads', quantitySold: 67, revenue: 8040, image: '' },
  ],
  recentActivity: [
    { id: '1', type: 'order', title: 'Order #ORD-20240115-001', description: 'Butter Chicken x2, Garlic Naan x3', amount: 1450, timestamp: now - 1000 * 60 * 5 },
    { id: '2', type: 'payment', title: 'COD Payment Collected', description: 'Order #ORD-20240115-001', amount: 1450, timestamp: now - 1000 * 60 * 15 },
    { id: '3', type: 'subscription', title: 'New Subscription', description: 'Monthly Premium Plan', amount: 2999, timestamp: now - 1000 * 60 * 30 },
    { id: '4', type: 'registration', title: 'New Customer', description: 'Rohit Verma registered', amount: 0, timestamp: now - 1000 * 60 * 60 * 2 },
  ],
};

export const mockDailyData: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  label: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
  revenue: Math.floor(Math.random() * 50000) + 20000,
  orders: Math.floor(Math.random() * 20) + 10,
  avgOrderValue: Math.floor(Math.random() * 500) + 300,
}));

export const mockWeeklyData: RevenueDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
  date: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  label: `Week ${12 - i}`,
  revenue: Math.floor(Math.random() * 300000) + 150000,
  orders: Math.floor(Math.random() * 80) + 40,
  avgOrderValue: Math.floor(Math.random() * 500) + 300,
}));

export const mockMonthlyData: RevenueDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
  date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  label: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  revenue: Math.floor(Math.random() * 1200000) + 500000,
  orders: Math.floor(Math.random() * 300) + 150,
  avgOrderValue: Math.floor(Math.random() * 500) + 300,
}));