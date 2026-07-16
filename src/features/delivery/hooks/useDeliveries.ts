import { create } from "zustand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Delivery,
  DeliveryListEntity,
  DeliveryFilters,
  DeliveryStatistics,
  DeliveryStatus,
} from "../types/delivery";
import { deliveryApi } from "../services/delivery.api";

interface DeliveriesState {
  filters: DeliveryFilters;
  selectedDelivery: Delivery | null;
  detailModalOpen: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  setFilters: (filters: Partial<DeliveryFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSelectedDelivery: (delivery: Delivery | null) => void;
  setDetailModalOpen: (open: boolean) => void;
}

const defaultFilters: DeliveryFilters = {
  page: 1,
  limit: 10,
  status: "all",
  provider: "all",
};

export const useDeliveriesStore = create<DeliveriesState>((set) => ({
  filters: { ...defaultFilters },
  selectedDelivery: null,
  detailModalOpen: false,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
      pagination: { ...state.pagination, page: 1 },
    })),

  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
      pagination: { ...state.pagination, page },
    })),

  setLimit: (limit) =>
    set((state) => ({
      filters: { ...state.filters, limit, page: 1 },
      pagination: { ...state.pagination, limit, page: 1 },
    })),

  setSelectedDelivery: (delivery) => set({ selectedDelivery: delivery }),
  setDetailModalOpen: (open) => set({ detailModalOpen: open }),
}));

export function useDeliveries(filters?: Partial<DeliveryFilters>) {
  const { filters: storeFilters } = useDeliveriesStore();

  const mergedFilters = { ...storeFilters, ...filters };

  return useQuery({
    queryKey: ["deliveries", mergedFilters],
    queryFn: () => deliveryApi.list(mergedFilters),
    placeholderData: (previousData) => previousData,
  });
}

export function useDeliveryDetail(id: string | null) {
  return useQuery({
    queryKey: ["delivery", id],
    queryFn: () => deliveryApi.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useDeliveryStats() {
  return useQuery({
    queryKey: ["deliveryStats"],
    queryFn: () => deliveryApi.getStats(),
    staleTime: 60_000,
  });
}

export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();
  const { setSelectedDelivery } = useDeliveriesStore();

  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: DeliveryStatus; remarks?: string }) =>
      deliveryApi.updateStatus(id, status, remarks),
    onSuccess: (updatedDelivery) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", updatedDelivery.id] });
      queryClient.invalidateQueries({ queryKey: ["deliveryStats"] });
      setSelectedDelivery(updatedDelivery);
    },
  });
}

export function useCancelDelivery() {
  const queryClient = useQueryClient();
  const { setSelectedDelivery } = useDeliveriesStore();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => deliveryApi.cancel(id, reason),
    onSuccess: (updatedDelivery) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", updatedDelivery.id] });
      queryClient.invalidateQueries({ queryKey: ["deliveryStats"] });
      setSelectedDelivery(updatedDelivery);
    },
  });
}

export function useRetryDelivery() {
  const queryClient = useQueryClient();
  const { setSelectedDelivery } = useDeliveriesStore();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deliveryApi.retry(id),
    onSuccess: (updatedDelivery) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", updatedDelivery.id] });
      queryClient.invalidateQueries({ queryKey: ["deliveryStats"] });
      setSelectedDelivery(updatedDelivery);
    },
  });
}