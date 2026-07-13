import { create } from 'zustand';
import { DateRange, ChartGranularity, ReportsData, RevenueDataPoint } from '../types/report';
import { mockReportsData, mockDailyData, mockWeeklyData, mockMonthlyData } from '../mock/reports';

interface ReportsStore {
  dateRange: DateRange;
  customStartDate: string;
  customEndDate: string;
  granularity: ChartGranularity;
  loading: boolean;
  data: ReportsData;
  dailyData: RevenueDataPoint[];
  weeklyData: RevenueDataPoint[];
  monthlyData: RevenueDataPoint[];

  setDateRange: (range: DateRange) => void;
  setCustomStartDate: (date: string) => void;
  setCustomEndDate: (date: string) => void;
  setGranularity: (g: ChartGranularity) => void;
  refreshData: () => void;
  getChartData: () => RevenueDataPoint[];
}

export const useReportsStore = create<ReportsStore>((set, get) => ({
  dateRange: '30d',
  customStartDate: '',
  customEndDate: '',
  granularity: 'daily',
  loading: false,
  data: mockReportsData,
  dailyData: mockDailyData,
  weeklyData: mockWeeklyData,
  monthlyData: mockMonthlyData,

  setDateRange: (dateRange) => set({ dateRange }),
  setCustomStartDate: (customStartDate) => set({ customStartDate }),
  setCustomEndDate: (customEndDate) => set({ customEndDate }),
  setGranularity: (granularity) => set({ granularity }),

  refreshData: () => {
    set({ loading: true });
    setTimeout(() => {
      set({ loading: false, data: mockReportsData });
    }, 800);
  },

  getChartData: () => {
    const { granularity, dailyData, weeklyData, monthlyData } = get();
    if (granularity === 'weekly') return weeklyData;
    if (granularity === 'monthly') return monthlyData;
    return dailyData;
  },
}));
