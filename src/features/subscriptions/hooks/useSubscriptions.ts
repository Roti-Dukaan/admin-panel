import { create } from "zustand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "../services/subscriptions.api";
import type {
  SubscriptionEntity,
  SubscriptionFilters,
  SubscriptionTimelineEntry,
  SubscriptionOccurrence,
} from "../types/subscription";

interface SubscriptionsStore {
  filters: SubscriptionFilters;
  selectedSubscription: SubscriptionEntity | null;
  drawerOpen: boolean;
  occurrences: SubscriptionOccurrence[];
  timeline: SubscriptionTimelineEntry[];
  loadingOccurrences: boolean;
  loadingTimeline: boolean;

  setFilters: (filters: Partial<SubscriptionFilters>) => void;
  setPage: (page: number) => void;
  setSelectedSubscription: (sub: SubscriptionEntity | null) => void;
  setDrawerOpen: (open: boolean) => void;
  loadOccurrences: (id: string) => Promise<void>;
  loadTimeline: (id: string) => Promise<void>;
}

const defaultFilters: SubscriptionFilters = {
  status: "ACTIVE",
  search: "",
  frequency: "all",
  page: 1,
  limit: 10,
};

export const useSubscriptionsStore = create<SubscriptionsStore>((set, get) => ({
  filters: { ...defaultFilters },
  selectedSubscription: null,
  drawerOpen: false,
  occurrences: [],
  timeline: [],
  loadingOccurrences: false,
  loadingTimeline: false,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ? newFilters.page : 1 },
    })),

  setPage: (page) => set((state) => ({ filters: { ...state.filters, page } })),

  setSelectedSubscription: (sub) => set({ selectedSubscription: sub }),

  setDrawerOpen: (open) => set({ drawerOpen: open }),

  loadOccurrences: async (id) => {
    set({ loadingOccurrences: true });
    try {
      const data = await subscriptionsApi.getOccurrences(id, { limit: 50 });
      set({ occurrences: data.data, loadingOccurrences: false });
    } catch {
      set({ occurrences: [], loadingOccurrences: false });
    }
  },

  loadTimeline: async (id) => {
    set({ loadingTimeline: true });
    try {
      const data = await subscriptionsApi.getTimeline(id);
      set({ timeline: data, loadingTimeline: false });
    } catch {
      set({ timeline: [], loadingTimeline: false });
    }
  },
}));

export function useSubscriptionsQuery() {
  const filters = useSubscriptionsStore((s) => s.filters);
  return useQuery({
    queryKey: ["admin-subscriptions", filters],
    queryFn: () => subscriptionsApi.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useSubscriptionDashboard() {
  return useQuery({
    queryKey: ["admin-subscriptions-dashboard"],
    queryFn: () => subscriptionsApi.getDashboard(),
    staleTime: 30_000,
  });
}

export function useSubscriptionAnalytics() {
  return useQuery({
    queryKey: ["admin-subscriptions-analytics"],
    queryFn: () => subscriptionsApi.getAnalytics(),
    staleTime: 60_000,
  });
}

export function useSubscriptionForecast(date?: string) {
  return useQuery({
    queryKey: ["admin-subscriptions-forecast", date],
    queryFn: () => subscriptionsApi.getForecast(date),
    staleTime: 30_000,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const setSelected = useSubscriptionsStore((s) => s.setSelectedSubscription);
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      subscriptionsApi.cancel(id, reason),
    onSuccess: (data) => {
      setSelected(data);
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-dashboard"] });
    },
  });
}

export function useRunFulfillment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetDate, triggeredBy }: { targetDate?: string; triggeredBy?: string }) =>
      subscriptionsApi.runFulfillment(targetDate, triggeredBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-forecast"] });
    },
  });
}
