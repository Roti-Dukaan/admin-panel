import { apiClient } from "@/lib/api/http";
import type {
  SubscriptionEntity,
  SubscriptionOccurrence,
  SubscriptionTimelineEntry,
  SubscriptionFilters,
  PaginatedResponse,
  SubscriptionAnalyticsOverview,
  SubscriptionGrowthPoint,
  KitchenForecast,
  DeliveryForecast,
  FulfillmentResult,
  FulfillmentJob,
  SubscriptionOpsDashboard,
  KitchenOpsForecast,
  DeliveryOpsForecast,
  SubscriptionOpsCalendar,
  SubscriptionOpsAnalytics,
  AdminAlert,
} from "../types/subscription";

function normalizePage<T>(res: any): PaginatedResponse<T> {
  const items: T[] = res?.data?.items ?? res?.items ?? res?.data?.data ?? res?.data ?? [];
  const total: number = res?.data?.total ?? res?.total ?? items.length;
  const page: number = res?.data?.page ?? res?.page ?? 1;
  const limit: number = res?.data?.limit ?? res?.data?.pageSize ?? res?.limit ?? (items.length || 1);
  const totalPages: number = res?.data?.totalPages ?? res?.totalPages ?? (Math.ceil(total / (limit || 1)) || 1);
  return { data: items, total, page, limit, totalPages };
}

export const subscriptionsApi = {
  async list(filters: Partial<SubscriptionFilters> = {}) {
    const params: Record<string, string> = {};
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.frequency && filters.frequency !== "all") params.frequency = filters.frequency;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
    const { data } = await apiClient.get("/admin/subscriptions", { params });
    return normalizePage<SubscriptionEntity>(data);
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/admin/subscriptions/${id}`);
    return (data?.data ?? data) as SubscriptionEntity;
  },

  async getTimeline(id: string) {
    const { data } = await apiClient.get(`/admin/subscriptions/${id}/timeline`);
    return (data?.data ?? data ?? []) as SubscriptionTimelineEntry[];
  },

  async getOccurrences(id: string, query: { status?: string; page?: number; limit?: number } = {}) {
    const params: Record<string, string> = {};
    if (query.status) params.status = query.status;
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    const { data } = await apiClient.get(`/admin/subscriptions/${id}/occurrences`, { params });
    return normalizePage<SubscriptionOccurrence>(data);
  },

  async cancel(id: string, reason?: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/cancel`, { reason });
    return (data?.data ?? data) as SubscriptionEntity;
  },

  async pause(id: string, reason?: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/pause`, { reason });
    return (data?.data ?? data) as SubscriptionEntity;
  },

  async resume(id: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/resume`, {});
    return (data?.data ?? data) as SubscriptionEntity;
  },

  async startVacation(id: string, startDate: string, endDate: string, reason?: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/vacation`, {
      startDate,
      endDate,
      reason,
    });
    return (data?.data ?? data) as SubscriptionEntity;
  },

  async endVacation(id: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/vacation/end`, {});
    return (data?.data ?? data) as SubscriptionEntity;
  },

  async skip(id: string, occurrenceDate: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/skip`, { occurrenceDate });
    return (data?.data ?? data) as SubscriptionEntity;
  },

  async runFulfillment(targetDate?: string, triggeredBy = "ADMIN", mealSlot?: string) {
    const { data } = await apiClient.post("/admin/subscriptions/fulfillment/run", {
      targetDate,
      triggeredBy,
      mealSlot,
    });
    return (data?.data ?? data) as FulfillmentResult;
  },

  async listFulfillmentJobs(page = 1, limit = 20) {
    const { data } = await apiClient.get("/admin/subscriptions/fulfillment/jobs", {
      params: { page: String(page), limit: String(limit) },
    });
    return {
      items: (data?.data ?? []) as FulfillmentJob[],
      total: data?.total ?? 0,
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
    };
  },

  async retryFulfillmentJob(id: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/fulfillment/jobs/${id}/retry`);
    return (data?.data ?? data) as FulfillmentResult;
  },

  async getDashboard() {
    const { data } = await apiClient.get("/admin/subscriptions/dashboard");
    return (data?.data ?? data) as {
      overview: SubscriptionAnalyticsOverview;
      recent: SubscriptionEntity[];
    };
  },

  async getAnalytics() {
    const { data } = await apiClient.get("/admin/subscriptions/analytics");
    return (data?.data ?? data) as {
      overview: SubscriptionAnalyticsOverview;
      growth: SubscriptionGrowthPoint[];
      pauseReasons: Array<{ reason: string; count: number }>;
      vacation: { totalVacations: number; activeNow: number; avgDurationDays: number };
      meals: Array<{ meal: string; count: number }>;
      delivery: { successRate: number; failedRate: number; avgFulfillmentMinutes: number };
      providers: Array<{ provider: string; utilization: number }>;
      forecast: { accuracy: number; avgError: number };
      kitchen: { utilization: number; peakMeal: string };
    };
  },

  async getForecast(date?: string) {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    const { data } = await apiClient.get("/admin/subscriptions/forecast", { params });
    return (data?.data ?? data) as {
      date: string;
      kitchen: KitchenForecast | null;
      delivery: DeliveryForecast | null;
    };
  },

  // ── Subscription Operations ──
  async getOpsDashboard(branchId?: string) {
    const params: Record<string, string> = {};
    if (branchId) params.branchId = branchId;
    const { data } = await apiClient.get("/admin/subscription-operations/dashboard", { params });
    return (data?.data ?? data) as SubscriptionOpsDashboard;
  },
  async getOpsKitchenForecast(date?: string, branchId?: string) {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (branchId) params.branchId = branchId;
    const { data } = await apiClient.get("/admin/subscription-operations/kitchen-forecast", { params });
    return (data?.data ?? data) as KitchenOpsForecast;
  },
  async getOpsKitchenForecastRange(from: string, to: string, branchId?: string) {
    const params: Record<string, string> = { from, to };
    if (branchId) params.branchId = branchId;
    const { data } = await apiClient.get("/admin/subscription-operations/kitchen-forecast/range", { params });
    return (data?.data ?? data) as KitchenOpsForecast[];
  },
  async getOpsDeliveryForecast(date?: string, branchId?: string) {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (branchId) params.branchId = branchId;
    const { data } = await apiClient.get("/admin/subscription-operations/delivery-forecast", { params });
    return (data?.data ?? data) as DeliveryOpsForecast;
  },
  async getOpsCalendar(year: number, month: number, branchId?: string) {
    const params: Record<string, string> = { year: String(year), month: String(month) };
    if (branchId) params.branchId = branchId;
    const { data } = await apiClient.get("/admin/subscription-operations/calendar", { params });
    return (data?.data ?? data) as SubscriptionOpsCalendar;
  },
  async getOpsAnalytics(days = 30, branchId?: string) {
    const params: Record<string, string> = { days: String(days) };
    if (branchId) params.branchId = branchId;
    const { data } = await apiClient.get("/admin/subscription-operations/analytics", { params });
    return (data?.data ?? data) as SubscriptionOpsAnalytics;
  },
  async getOpsAlerts(resolved?: boolean, branchId?: string) {
    const params: Record<string, string> = {};
    if (resolved !== undefined) params.resolved = String(resolved);
    if (branchId) params.branchId = branchId;
    const { data } = await apiClient.get("/admin/subscription-operations/alerts", { params });
    return (data?.data ?? data) as AdminAlert[];
  },
  async detectOpsAlerts(branchId?: string) {
    const params: Record<string, string> = {};
    if (branchId) params.branchId = branchId;
    const { data } = await apiClient.post("/admin/subscription-operations/alerts/detect", undefined, { params });
    return (data?.data ?? data) as AdminAlert[];
  },
  async resolveOpsAlert(id: string) {
    const { data } = await apiClient.patch(`/admin/subscription-operations/alerts/${id}/resolve`);
    return (data?.data ?? data) as AdminAlert;
  },
  async exportOpsReport(opts: { type: string; format: "csv" | "excel" | "pdf"; dateFrom?: string; dateTo?: string; branchId?: string }) {
    const { data } = await apiClient.post("/admin/subscription-operations/reports/export", opts, {
      responseType: "blob",
    });
    return data as Blob;
  },
};
