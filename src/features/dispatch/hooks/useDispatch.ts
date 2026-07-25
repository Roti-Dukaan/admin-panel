"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { dispatchApi, type DispatchQuery } from "../services/dispatch.api";
import type { DispatchBatchListResponse } from "../types/dispatch";

const DISPATCH_QUERY_KEY = ["dispatch", "batches"] as const;
const DISPATCH_DASHBOARD_KEY = ["dispatch", "dashboard"] as const;
const AUTO_REFRESH_MS = 30_000;

/** Dashboard summary. */
export function useDispatchDashboard() {
  return useQuery({
    queryKey: DISPATCH_DASHBOARD_KEY,
    queryFn: () => dispatchApi.getDashboard(),
    staleTime: AUTO_REFRESH_MS,
    refetchInterval: AUTO_REFRESH_MS,
  });
}

/** Batch list with pagination. */
export function useDispatchBatches(query: DispatchQuery) {
  return useQuery({
    queryKey: [DISPATCH_QUERY_KEY, query],
    queryFn: () => dispatchApi.listBatches(query),
    staleTime: AUTO_REFRESH_MS,
    refetchInterval: AUTO_REFRESH_MS,
    placeholderData: keepPreviousData,
  });
}

/** Batch detail. */
export function useDispatchBatchDetail(id: string | null) {
  return useQuery({
    queryKey: ["dispatch", "batch", id],
    queryFn: () => dispatchApi.getBatchDetail(id!),
    enabled: !!id,
    staleTime: AUTO_REFRESH_MS,
  });
}

/** Create batch mutation. */
export function useCreateDispatchBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { orderIds: string[]; deliveryZone?: string; provider?: string }) =>
      dispatchApi.createBatch(data),
    onSuccess: () => {
      toast.success("Dispatch batch created.");
      qc.invalidateQueries({ queryKey: DISPATCH_QUERY_KEY });
      qc.invalidateQueries({ queryKey: DISPATCH_DASHBOARD_KEY });
    },
    onError: () => {
      toast.error("Failed to create dispatch batch.");
    },
  });
}

/** Update batch status mutation. */
export function useUpdateBatchStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      dispatchApi.updateBatchStatus(id, status),
    onSuccess: () => {
      toast.success("Batch status updated.");
      qc.invalidateQueries({ queryKey: DISPATCH_QUERY_KEY });
      qc.invalidateQueries({ queryKey: DISPATCH_DASHBOARD_KEY });
    },
    onError: () => {
      toast.error("Failed to update batch status.");
    },
  });
}
