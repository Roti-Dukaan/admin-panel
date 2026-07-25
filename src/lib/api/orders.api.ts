import { apiClient } from "./http";
import type { InvoiceView } from "../../features/orders/types/invoice";
import { toBackendOrderStatus } from "../../features/orders/utils/status";
import type { OrderStatus } from "../../features/orders/types/order";

interface OrderListParams {
  page?: number
  limit?: number
  status?: string
  paymentMethod?: string
  paymentStatus?: string
  orderType?: string
  search?: string
  dateFilter?: string
  customStartDate?: string
  customEndDate?: string
  branchId?: string
  cityId?: string
  areaId?: string
}

/** Compute [from, to] ISO instants (UTC) for a date preset, reckoned in IST. */
function resolveDateRange(
  dateFilter: string | undefined,
  customStartDate?: string,
  customEndDate?: string,
): { dateFrom?: string; dateTo?: string } {
  if (dateFilter === "custom") {
    if (!customStartDate || !customEndDate) return {};
    const start = new Date(`${customStartDate}T00:00:00+05:30`)
    const end = new Date(`${customEndDate}T23:59:59+05:30`)
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() }
  }

  const now = new Date()
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  const startOfTodayIst = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate(), 0, 0, 0, 0)
  const startOfTodayUtc = new Date(startOfTodayIst.getTime() - istNow.getTime() + now.getTime())

  switch (dateFilter) {
    case "today": {
      const to = new Date(startOfTodayUtc.getTime() + 24 * 60 * 60 * 1000)
      return { dateFrom: startOfTodayUtc.toISOString(), dateTo: to.toISOString() }
    }
    case "yesterday": {
      const from = new Date(startOfTodayUtc.getTime() - 24 * 60 * 60 * 1000)
      const to = startOfTodayUtc
      return { dateFrom: from.toISOString(), dateTo: to.toISOString() }
    }
    case "7d": {
      const from = new Date(startOfTodayUtc.getTime() - 7 * 24 * 60 * 60 * 1000)
      const to = new Date(startOfTodayUtc.getTime() + 24 * 60 * 60 * 1000)
      return { dateFrom: from.toISOString(), dateTo: to.toISOString() }
    }
    case "30d": {
      const from = new Date(startOfTodayUtc.getTime() - 30 * 24 * 60 * 60 * 1000)
      const to = new Date(startOfTodayUtc.getTime() + 24 * 60 * 60 * 1000)
      return { dateFrom: from.toISOString(), dateTo: to.toISOString() }
    }
    case "this-month": {
      const firstOfMonthIst = new Date(istNow.getFullYear(), istNow.getMonth(), 1, 0, 0, 0, 0)
      const from = new Date(firstOfMonthIst.getTime() - istNow.getTime() + now.getTime())
      const to = new Date(startOfTodayUtc.getTime() + 24 * 60 * 60 * 1000)
      return { dateFrom: from.toISOString(), dateTo: to.toISOString() }
    }
    default:
      return {}
  }
}

export const ordersApi = {
  list: async (params: OrderListParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", String(params.page));
    if (params.limit) queryParams.set("limit", String(params.limit));
    if (params.status && params.status !== "all") {
      queryParams.set("status", toBackendOrderStatus(params.status as OrderStatus));
    }
    if (params.paymentMethod && params.paymentMethod !== "all") queryParams.set("paymentMethod", params.paymentMethod);
    if (params.paymentStatus && params.paymentStatus !== "all") queryParams.set("paymentStatus", params.paymentStatus);
    if (params.orderType && params.orderType !== "all") queryParams.set("orderType", params.orderType);
    if (params.search) queryParams.set("search", params.search);
    if (params.branchId) queryParams.set("branchId", params.branchId);
    if (params.cityId) queryParams.set("cityId", params.cityId);
    if (params.areaId) queryParams.set("areaId", params.areaId);

    const { dateFrom, dateTo } = resolveDateRange(
      params.dateFilter,
      params.customStartDate,
      params.customEndDate,
    );
    if (dateFrom) queryParams.set("dateFrom", dateFrom);
    if (dateTo) queryParams.set("dateTo", dateTo);

    const { data } = await apiClient.get<{ success: boolean; data: { items: unknown[]; total: number; page: number; limit: number } }>(
      `/admin/orders?${queryParams.toString()}`
    );
    return data.data;
  },

  getStats: async (branchId?: string) => {
    const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
    const { data } = await apiClient.get<{ success: boolean; data: unknown }>(`/admin/orders/stats${query}`);
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: unknown }>(`/admin/orders/${id}`);
    return data.data;
  },

  updateStatus: async (id: string, dto: { status: string; remarks?: string }) => {
    const { data } = await apiClient.patch<{ success: boolean; data: unknown }>(`/admin/orders/${id}/status`, dto);
    return data.data;
  },

  getInvoice: async (id: string): Promise<InvoiceView> => {
    const { data } = await apiClient.get<{ success: boolean; data: InvoiceView }>(
      `/admin/orders/${id}/invoice`
    );
    return data.data;
  },

  regenerateInvoice: async (id: string): Promise<InvoiceView> => {
    const { data } = await apiClient.post<{ success: boolean; data: InvoiceView }>(
      `/admin/orders/${id}/invoice/regenerate`
    );
    return data.data;
  },
};