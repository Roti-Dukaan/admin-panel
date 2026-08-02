import { apiClient } from "@/lib/api/http";
import { todayDateKey, tomorrowDateKey } from "@/lib/date";

export const subscriptionsApi = {
  async list(params?: Record<string, string>) {
    const { data } = await apiClient.get("/admin/subscriptions", { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/admin/subscriptions/${id}`);
    return data?.data;
  },

  async getDeliveriesByDate(date: string, params?: Record<string, string>) {
    const { data } = await apiClient.get("/admin/subscriptions/deliveries", {
      params: { date, ...params },
    });
    return data?.data ?? [];
  },

  async getKitchenSummary(date: string, branchId?: string) {
    const { data } = await apiClient.get("/admin/subscriptions/kitchen/summary", {
      params: { date, branchId },
    });
    return data?.data;
  },

  async pause(id: string, reason?: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/pause`, { reason });
    return data?.data;
  },

  async resume(id: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/resume`);
    return data?.data;
  },

  async cancel(id: string, reason?: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/cancel`, { reason });
    return data?.data;
  },

  async runFulfillment(targetDate?: string, triggeredBy?: string, mealSlot?: string) {
    const { data } = await apiClient.post("/admin/subscriptions/fulfillment/run", {
      targetDate,
      triggeredBy,
      mealSlot,
    });
    return data?.data;
  },

  async listFulfillmentJobs(page = 1, limit = 20) {
    const { data } = await apiClient.get("/admin/subscriptions/fulfillment/runs", {
      params: { page: String(page), limit: String(limit) },
    });
    return {
      items: data?.items ?? [],
      total: data?.total ?? 0,
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      totalPages: data?.totalPages ?? 0,
    };
  },

  async retryFulfillmentJob(id: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/fulfillment/runs/${id}/retry`);
    return data?.data;
  },

  async skip(id: string, occurrenceDate: string, reason?: string) {
    const { data } = await apiClient.post(`/admin/subscriptions/${id}/skip`, {
      deliveryDate: occurrenceDate,
      reason,
    });
    return data?.data;
  },

  async getOccurrences(id: string, params?: Record<string, string>) {
    const { data } = await apiClient.get(`/admin/subscriptions/${id}/deliveries`, { params });
    return { data: data?.data ?? [] };
  },

  async getTimeline(_id: string) {
    return [];
  },

  async getDashboard() {
    const { data } = await apiClient.get("/admin/subscriptions", { params: { limit: "1", page: "1" } });
    return { totalActive: data?.total ?? 0 };
  },

  async getAnalytics() {
    return {};
  },

  async getForecast(date?: string) {
    const target = date ?? tomorrowDateKey();
    const kitchen = await subscriptionsApi.getKitchenSummary(target);
    return { kitchen, delivery: null };
  },

  async startVacation(_id: string, _startDate: string, _endDate: string, _reason?: string) {
    throw new Error("Vacation mode is not supported in the current subscription engine");
  },

  async endVacation(_id: string) {
    throw new Error("Vacation mode is not supported in the current subscription engine");
  },

  async getOpsDashboard(_branchId?: string) {
    return {};
  },

  async getOpsKitchenForecast(date?: string, branchId?: string) {
    return subscriptionsApi.getKitchenSummary(date ?? todayDateKey(), branchId);
  },

  async getOpsKitchenForecastRange(_from: string, _to: string, _branchId?: string) {
    return [];
  },

  async getOpsDeliveryForecast(_date?: string, _branchId?: string) {
    return null;
  },

  async getOpsCalendar(_year: number, _month: number, _branchId?: string) {
    return [];
  },

  async getOpsAnalytics(_days?: number, _branchId?: string) {
    return {};
  },

  async getOpsAlerts(_resolved?: boolean, _branchId?: string) {
    return [];
  },

  async detectOpsAlerts(_branchId?: string) {
    return [];
  },

  async resolveOpsAlert(_id: string) {
    return null;
  },

  async exportOpsReport(_params: Record<string, string | undefined>) {
    return new Blob();
  },
};
