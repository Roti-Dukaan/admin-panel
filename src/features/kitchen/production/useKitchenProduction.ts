import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kitchenProductionApi } from "./kitchen-production.api";
import { connectRealtime, disconnectRealtime, onRealtime } from "@/lib/realtime/socket";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import type {
  CreateProductionBatchPayload,
  AddBatchItemPayload,
  UpdatePreparedPayload,
  UpdateBatchStatusPayload,
  KitchenReportOptions,
} from "./types";

const PLAN_KEY = (date?: string) => ["kitchen-production", "plan", date ?? "today"];
const BATCHES_KEY = (date?: string) => ["kitchen-production", "batches", date ?? "today"];

export function useProductionPlan(date?: string) {
  return useQuery({
    queryKey: PLAN_KEY(date),
    queryFn: () => kitchenProductionApi.getPlan(date),
    refetchInterval: 30_000,
  });
}

export function useProductionSummary(date?: string) {
  return useQuery({
    queryKey: ["kitchen-production", "summary", date ?? "today"],
    queryFn: () => kitchenProductionApi.getSummary(date),
    refetchInterval: 30_000,
  });
}

export function useProductionBatches(date?: string) {
  return useQuery({
    queryKey: BATCHES_KEY(date),
    queryFn: () => kitchenProductionApi.listBatches(date),
    refetchInterval: 30_000,
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductionBatchPayload) => kitchenProductionApi.createBatch(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-production", "batches"] });
    },
  });
}

export function useAddBatchItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, dto }: { batchId: string; dto: AddBatchItemPayload }) =>
      kitchenProductionApi.addBatchItem(batchId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-production", "batches"] });
    },
  });
}

export function useUpdatePrepared() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      itemId,
      dto,
    }: {
      batchId: string;
      itemId: string;
      dto: UpdatePreparedPayload;
    }) => kitchenProductionApi.updatePrepared(batchId, itemId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-production", "batches"] });
    },
  });
}

export function useUpdateBatchStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, dto }: { batchId: string; dto: UpdateBatchStatusPayload }) =>
      kitchenProductionApi.updateBatchStatus(batchId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-production", "batches"] });
    },
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => kitchenProductionApi.deleteBatch(batchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-production", "batches"] });
    },
  });
}

/** Subscribe to realtime production updates and refresh queries. */
export function useProductionRealtime(date?: string) {
  const qc = useQueryClient();
  React.useEffect(() => {
    const socket = connectRealtime();
    socket.emit("subscribe", "kitchen:production");
    const off = onRealtime("kitchen:production_update", () => {
      qc.invalidateQueries({ queryKey: PLAN_KEY(date) });
      qc.invalidateQueries({ queryKey: BATCHES_KEY(date) });
    });
    return () => {
      off();
      disconnectRealtime();
    };
  }, [qc, date]);
}

export function useCanManageProduction(): boolean {
  const roles = useAdminAuthStore((s) => s.user?.roles ?? []);
  return roles.includes("ADMIN") || roles.includes("OWNER") || roles.includes("KITCHEN_MANAGER");
}

export function useCanUpdatePrepared(): boolean {
  const roles = useAdminAuthStore((s) => s.user?.roles ?? []);
  return (
    useCanManageProduction() || roles.includes("KITCHEN_STAFF")
  );
}

export async function downloadKitchenReport(opts: KitchenReportOptions) {
  const blob = await kitchenProductionApi.exportReport(opts);
  const ext = opts.format === "excel" ? "xlsx" : opts.format;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kitchen_${opts.type}_${new Date().toISOString().slice(0, 10)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
