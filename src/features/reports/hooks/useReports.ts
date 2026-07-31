import { create } from 'zustand';
import { DateRange, ChartGranularity, ReportsData, RevenueDataPoint } from '../types/report';
import {
  aggregateMonthly,
  aggregateWeekly,
  fetchReports,
  type ReportsFilters,
} from '../api/reports.api';
import type { DashboardLocationFiltersValue } from '@/features/super-admin-dashboard/components/DashboardLocationFilters';

const emptyReportsData: ReportsData = {
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
    mostPopularPlan: '—',
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
    peakDeliverySlot: '—',
    pincodeDistribution: [],
  },
  paymentAnalytics: {
    cod: 0,
    online: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    total: 0,
    codPendingCollection: 0,
    codCollected: 0,
    codSettled: 0,
    codOrders: 0,
    onlineOrders: 0,
    pendingCollectionAmount: 0,
  },
  customerInsights: {
    repeatCustomers: 0,
    firstTimeCustomers: 0,
    customerRetention: 0,
    topSpendingCustomers: [],
    avgOrdersPerCustomer: 0,
    totalCustomers: 0,
  },
  bestSellingItems: [],
  recentActivity: [],
  popularSlots: [],
};

interface ReportsStore {
  dateRange: DateRange;
  customStartDate: string;
  customEndDate: string;
  granularity: ChartGranularity;
  loading: boolean;
  error: string | null;
  data: ReportsData;
  dailyData: RevenueDataPoint[];
  weeklyData: RevenueDataPoint[];
  monthlyData: RevenueDataPoint[];
  locationFilters: DashboardLocationFiltersValue;
  forcedBranchId?: string;

  setDateRange: (range: DateRange) => void;
  setCustomStartDate: (date: string) => void;
  setCustomEndDate: (date: string) => void;
  setGranularity: (g: ChartGranularity) => void;
  setLocationFilters: (filters: DashboardLocationFiltersValue) => void;
  setForcedBranchId: (branchId?: string) => void;
  refreshData: () => Promise<void>;
  getChartData: () => RevenueDataPoint[];
  buildFilters: () => ReportsFilters;
}

export const useReportsStore = create<ReportsStore>((set, get) => ({
  dateRange: '30d',
  customStartDate: '',
  customEndDate: '',
  granularity: 'daily',
  loading: true,
  error: null,
  data: emptyReportsData,
  dailyData: [],
  weeklyData: [],
  monthlyData: [],
  locationFilters: {},

  setDateRange: (dateRange) => {
    set({ dateRange });
    void get().refreshData();
  },
  setCustomStartDate: (customStartDate) => set({ customStartDate }),
  setCustomEndDate: (customEndDate) => set({ customEndDate }),
  setGranularity: (granularity) => set({ granularity }),
  setLocationFilters: (locationFilters) => {
    set({ locationFilters });
    void get().refreshData();
  },
  setForcedBranchId: (forcedBranchId) => {
    set({ forcedBranchId });
    void get().refreshData();
  },

  buildFilters: () => {
    const state = get();
    return {
      datePreset: state.dateRange,
      startDate: state.customStartDate || undefined,
      endDate: state.customEndDate || undefined,
      cityId: state.locationFilters.cityId,
      areaId: state.locationFilters.areaId,
      branchId: state.forcedBranchId ?? state.locationFilters.branchId,
    };
  },

  refreshData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetchReports(get().buildFilters());
      const dailyData = response.revenueChart;
      set({
        loading: false,
        data: response,
        dailyData,
        weeklyData: aggregateWeekly(dailyData),
        monthlyData: aggregateMonthly(dailyData),
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load reports',
        data: emptyReportsData,
        dailyData: [],
        weeklyData: [],
        monthlyData: [],
      });
    }
  },

  getChartData: () => {
    const { granularity, dailyData, weeklyData, monthlyData } = get();
    if (granularity === 'weekly') return weeklyData;
    if (granularity === 'monthly') return monthlyData;
    return dailyData;
  },
}));
