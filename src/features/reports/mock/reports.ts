import { ReportsData } from '../types/report';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

function generateDailyRevenue(days: number) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 18000 : 24000;
    const revenue = base + Math.floor(Math.random() * 8000) - 3000;
    const orders = Math.floor(revenue / 180) + Math.floor(Math.random() * 20) - 10;
    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: Math.max(revenue, 8000),
      orders: Math.max(orders, 30),
      avgOrderValue: Math.round(revenue / Math.max(orders, 1)),
    });
  }
  return data;
}

function generateWeeklyRevenue(weeks: number) {
  const data = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(now - i * 7 * day);
    const base = 150000 + Math.floor(Math.random() * 40000);
    const revenue = base + Math.floor(Math.random() * 30000) - 15000;
    const orders = Math.floor(revenue / 185) + Math.floor(Math.random() * 50) - 25;
    data.push({
      date: date.toISOString().split('T')[0],
      label: `Week ${weeks - i}`,
      revenue: Math.max(revenue, 100000),
      orders: Math.max(orders, 150),
      avgOrderValue: Math.round(revenue / Math.max(orders, 1)),
    });
  }
  return data;
}

function generateMonthlyRevenue(months: number) {
  const data = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now - i * 30 * day);
    const base = 600000 + Math.floor(Math.random() * 150000);
    const revenue = base + Math.floor(Math.random() * 100000) - 50000;
    const orders = Math.floor(revenue / 190) + Math.floor(Math.random() * 200) - 100;
    data.push({
      date: date.toISOString().split('T')[0],
      label: monthNames[date.getMonth()],
      revenue: Math.max(revenue, 400000),
      orders: Math.max(orders, 800),
      avgOrderValue: Math.round(revenue / Math.max(orders, 1)),
    });
  }
  return data;
}

export const mockReportsData: ReportsData = {
  kpis: [
    { key: 'totalRevenue', label: 'Total Revenue', value: 784500, previousValue: 712300, format: 'currency', icon: 'IndianRupee', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { key: 'totalOrders', label: 'Total Orders', value: 4230, previousValue: 3890, format: 'number', icon: 'ShoppingBag', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { key: 'avgOrderValue', label: 'Avg Order Value', value: 185, previousValue: 178, format: 'currency', icon: 'TrendingUp', color: 'text-violet-600', bgColor: 'bg-violet-50' },
    { key: 'activeCustomers', label: 'Active Customers', value: 1240, previousValue: 1180, format: 'number', icon: 'Users', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { key: 'newCustomers', label: 'New Customers', value: 186, previousValue: 142, format: 'number', icon: 'UserPlus', color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { key: 'subscriptionRevenue', label: 'Subscription Revenue', value: 485200, previousValue: 438700, format: 'currency', icon: 'CreditCard', color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { key: 'oneTimeRevenue', label: 'One-Time Revenue', value: 299300, previousValue: 273600, format: 'currency', icon: 'Zap', color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { key: 'codCollection', label: 'COD Collection', value: 142800, previousValue: 128400, format: 'currency', icon: 'Banknote', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { key: 'onlinePayments', label: 'Online Payments', value: 641700, previousValue: 583900, format: 'currency', icon: 'CreditCard', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  ],

  revenueChart: generateDailyRevenue(30),

  orderAnalytics: {
    completed: 3890,
    cancelled: 186,
    pending: 154,
    avgPrepTime: 18,
    avgDeliveryTime: 32,
    totalOrders: 4230,
  },

  menuPerformance: [
    { id: 'food-001', name: 'Jonna Roti', category: 'Rotis', orders: 1840, revenue: 46000, trend: 12, image: '/foods/jonna-roti.jpg' },
    { id: 'food-003', name: 'Chapathi', category: 'Rotis', orders: 1520, revenue: 30400, trend: 8, image: '/foods/chapathi.jpg' },
    { id: 'food-004', name: 'Phulka', category: 'Rotis', orders: 980, revenue: 19600, trend: -3, image: '/foods/phulka.jpg' },
    { id: 'food-002', name: 'Ragi Roti', category: 'Rotis', orders: 760, revenue: 22800, trend: 15, image: '/foods/ragi-roti.jpg' },
    { id: 'food-005', name: 'Dal Tadka', category: 'Veg Curries', orders: 2100, revenue: 52500, trend: 10, image: '/foods/dal-tadka.jpg' },
    { id: 'food-006', name: 'Tomato Pappu', category: 'Veg Curries', orders: 1680, revenue: 42000, trend: 6, image: '/foods/tomato-pappu.jpg' },
    { id: 'food-007', name: 'Paneer Curry', category: 'Veg Curries', orders: 1240, revenue: 49600, trend: 18, image: '/foods/paneer-curry.jpg' },
    { id: 'food-008', name: 'Mix Veg', category: 'Veg Curries', orders: 1100, revenue: 33000, trend: 4, image: '/foods/mix-veg.jpg' },
    { id: 'food-009', name: 'Chicken Curry', category: 'Non-Veg Curries', orders: 1560, revenue: 70200, trend: 22, image: '/foods/chicken-curry.jpg' },
    { id: 'food-010', name: 'Egg Curry', category: 'Non-Veg Curries', orders: 920, revenue: 32200, trend: 5, image: '/foods/egg-curry.jpg' },
    { id: 'food-011', name: 'Mutton Curry', category: 'Non-Veg Curries', orders: 480, revenue: 33600, trend: 30, image: '/foods/mutton-curry.jpg' },
    { id: 'food-012', name: '2 Rotis + Veg Curry', category: 'Combos', orders: 1890, revenue: 66150, trend: 14, image: '/foods/combo-veg.jpg' },
    { id: 'food-013', name: '3 Rotis + Non-Veg', category: 'Combos', orders: 1340, revenue: 67000, trend: 20, image: '/foods/combo-nonveg.jpg' },
    { id: 'food-014', name: 'Family Thali', category: 'Combos', orders: 620, revenue: 43400, trend: 25, image: '/foods/family-thali.jpg' },
  ],

  subscriptionInsights: {
    activePlans: 842,
    weeklySubscribers: 312,
    monthlySubscribers: 530,
    mostPopularPlan: 'Family Plan',
    subscriptionRevenue: 485200,
    renewals: 286,
    churnRate: 4.2,
  },

  deliveryAnalytics: {
    lunchOrders: 2340,
    dinnerOrders: 1560,
    breakfastOrders: 420,
    eveningOrders: 310,
    avgDeliveryTime: 32,
    peakDeliverySlot: 'Lunch (12:00 - 2:00 PM)',
    pincodeDistribution: [
      { pincode: '500034', orders: 1240, percentage: 29 },
      { pincode: '500089', orders: 980, percentage: 23 },
      { pincode: '500081', orders: 720, percentage: 17 },
      { pincode: '500084', orders: 540, percentage: 13 },
      { pincode: '500032', orders: 420, percentage: 10 },
      { pincode: 'Others', orders: 330, percentage: 8 },
    ],
  },

  paymentAnalytics: {
    cod: 142800,
    online: 641700,
    pending: 12400,
    failed: 8200,
    refunded: 15600,
    total: 820700,
  },

  customerInsights: {
    repeatCustomers: 876,
    firstTimeCustomers: 364,
    customerRetention: 72.4,
    topSpendingCustomers: [
      { name: 'Rajesh Kumar', spend: 48500, orders: 142 },
      { name: 'Priya Sharma', spend: 42300, orders: 128 },
      { name: 'Amit Patel', spend: 38900, orders: 115 },
      { name: 'Sneha Reddy', spend: 35200, orders: 104 },
      { name: 'Vikram Singh', spend: 31800, orders: 96 },
    ],
    avgOrdersPerCustomer: 3.4,
    totalCustomers: 1240,
  },

  popularSlots: [
    { slot: 'Breakfast', orders: 420, color: '#f97316' },
    { slot: 'Lunch', orders: 2340, color: '#22c55e' },
    { slot: 'Evening', orders: 310, color: '#a855f7' },
    { slot: 'Dinner', orders: 1560, color: '#3b82f6' },
  ],

  bestSellingItems: [
    { id: 'food-005', name: 'Dal Tadka', category: 'Veg Curries', quantitySold: 2100, revenue: 52500, image: '/foods/dal-tadka.jpg' },
    { id: 'food-012', name: '2 Rotis + Veg Curry', category: 'Combos', quantitySold: 1890, revenue: 66150, image: '/foods/combo-veg.jpg' },
    { id: 'food-001', name: 'Jonna Roti', category: 'Rotis', quantitySold: 1840, revenue: 46000, image: '/foods/jonna-roti.jpg' },
    { id: 'food-006', name: 'Tomato Pappu', category: 'Veg Curries', quantitySold: 1680, revenue: 42000, image: '/foods/tomato-pappu.jpg' },
    { id: 'food-009', name: 'Chicken Curry', category: 'Non-Veg Curries', quantitySold: 1560, revenue: 70200, image: '/foods/chicken-curry.jpg' },
    { id: 'food-003', name: 'Chapathi', category: 'Rotis', quantitySold: 1520, revenue: 30400, image: '/foods/chapathi.jpg' },
    { id: 'food-013', name: '3 Rotis + Non-Veg', category: 'Combos', quantitySold: 1340, revenue: 67000, image: '/foods/combo-nonveg.jpg' },
    { id: 'food-007', name: 'Paneer Curry', category: 'Veg Curries', quantitySold: 1240, revenue: 49600, image: '/foods/paneer-curry.jpg' },
    { id: 'food-008', name: 'Mix Veg', category: 'Veg Curries', quantitySold: 1100, revenue: 33000, image: '/foods/mix-veg.jpg' },
    { id: 'food-004', name: 'Phulka', category: 'Rotis', quantitySold: 980, revenue: 19600, image: '/foods/phulka.jpg' },
  ],

  recentActivity: [
    { id: 'act-001', type: 'order', title: 'New Order #RDK-1247', description: 'Rajesh Kumar ordered 2 Rotis + Dal Tadka', amount: 155, timestamp: now - 15 * 60000 },
    { id: 'act-002', type: 'payment', title: 'Payment Received', description: 'Priya Sharma paid via UPI for #RDK-1246', amount: 210, timestamp: now - 32 * 60000 },
    { id: 'act-003', type: 'subscription', title: 'New Subscription', description: 'Amit Patel started Family Plan (Monthly)', amount: 1699, timestamp: now - 48 * 60000 },
    { id: 'act-004', type: 'registration', title: 'New Customer', description: 'Sneha Reddy registered via mobile app', timestamp: now - 1.5 * 3600000 },
    { id: 'act-005', type: 'order', title: 'Order Delivered #RDK-1240', description: 'Vikram Singh - 3 Rotis + Chicken Curry', amount: 250, timestamp: now - 2 * 3600000 },
    { id: 'act-006', type: 'payment', title: 'COD Collected', description: 'Anita Devi paid ₹130 cash for #RDK-1238', amount: 130, timestamp: now - 3 * 3600000 },
    { id: 'act-007', type: 'subscription', title: 'Subscription Renewed', description: 'Rahul Verma renewed Premium Plan', amount: 2499, timestamp: now - 4 * 3600000 },
    { id: 'act-008', type: 'order', title: 'Bulk Order #RDK-1235', description: 'Corporate - 25 meals for Tech Corp office', amount: 4375, timestamp: now - 5 * 3600000 },
    { id: 'act-009', type: 'registration', title: 'New Customer', description: 'Karthik Nair registered via website', timestamp: now - 6 * 3600000 },
    { id: 'act-010', type: 'payment', title: 'Payment Received', description: 'Deepa Menon paid via card for #RDK-1230', amount: 195, timestamp: now - 7 * 3600000 },
  ],
};

export const mockDailyData = generateDailyRevenue(30);
export const mockWeeklyData = generateWeeklyRevenue(12);
export const mockMonthlyData = generateMonthlyRevenue(6);
