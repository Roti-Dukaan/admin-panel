import { apiClient } from "@/lib/api/http";
import type {
  ProductionPlan,
  ProductionSummary,
  ProductionBatch,
  CreateProductionBatchPayload,
  AddBatchItemPayload,
  UpdatePreparedPayload,
  UpdateBatchStatusPayload,
  KitchenReportOptions,
} from "./types";

export const kitchenProductionApi = {
  async getPlan(date?: string) {
    const { data } = await apiClient.get("/admin/kitchen-production/plan", {
      params: date ? { date } : {},
    });
    return (data?.data ?? data) as ProductionPlan;
  },

  async getSummary(date?: string) {
    const { data } = await apiClient.get("/admin/kitchen-production/summary", {
      params: date ? { date } : {},
    });
    return (data?.data ?? data) as ProductionSummary;
  },

  async listBatches(date?: string) {
    const { data } = await apiClient.get("/admin/kitchen-production/batches", {
      params: date ? { date } : {},
    });
    return (data?.data ?? data) as ProductionBatch[];
  },

  async getBatch(id: string) {
    const { data } = await apiClient.get(`/admin/kitchen-production/batches/${id}`);
    return (data?.data ?? data) as ProductionBatch;
  },

  async createBatch(payload: CreateProductionBatchPayload) {
    const { data } = await apiClient.post("/admin/kitchen-production/batches", payload);
    return (data?.data ?? data) as ProductionBatch;
  },

  async addBatchItem(batchId: string, payload: AddBatchItemPayload) {
    const { data } = await apiClient.post(
      `/admin/kitchen-production/batches/${batchId}/items`,
      payload,
    );
    return (data?.data ?? data) as ProductionBatch["items"][number];
  },

  async updatePrepared(batchId: string, itemId: string, payload: UpdatePreparedPayload) {
    const { data } = await apiClient.patch(
      `/admin/kitchen-production/batches/${batchId}/items/${itemId}/prepared`,
      payload,
    );
    return (data?.data ?? data) as ProductionBatch["items"][number];
  },

  async updateBatchStatus(batchId: string, payload: UpdateBatchStatusPayload) {
    const { data } = await apiClient.patch(
      `/admin/kitchen-production/batches/${batchId}/status`,
      payload,
    );
    return (data?.data ?? data) as ProductionBatch;
  },

  async deleteBatch(batchId: string) {
    const { data } = await apiClient.delete(`/admin/kitchen-production/batches/${batchId}`);
    return (data?.data ?? data) as { success: boolean };
  },

  async exportReport(opts: KitchenReportOptions): Promise<Blob> {
    const { data } = await apiClient.post(
      "/admin/kitchen-production/reports/export",
      opts,
      { responseType: "blob" },
    );
    return data as Blob;
  },
};
