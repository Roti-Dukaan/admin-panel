import { create } from "zustand";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "../services/subscriptions.api";
import { connectRealtime, disconnectRealtime, onRealtime } from "@/lib/realtime/socket";
import { useOpsBranchStore } from "./useOpsBranch";
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

function useLifecycleMutation(
  fn: (params: { id: string; reason?: string; startDate?: string; endDate?: string; occurrenceDate?: string }) => Promise<SubscriptionEntity>,
) {
  const queryClient = useQueryClient();
  const setSelected = useSubscriptionsStore((s) => s.setSelectedSubscription);
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      setSelected(data);
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-dashboard"] });
    },
  });
}

export function usePauseSubscription() {
  return useLifecycleMutation(({ id, reason }) => subscriptionsApi.pause(id, reason));
}

export function useResumeSubscription() {
  return useLifecycleMutation(({ id }) => subscriptionsApi.resume(id));
}

export function useStartVacation() {
  return useLifecycleMutation(({ id, startDate, endDate, reason }) =>
    subscriptionsApi.startVacation(id, startDate!, endDate!, reason),
  );
}

export function useEndVacation() {
  return useLifecycleMutation(({ id }) => subscriptionsApi.endVacation(id));
}

export function useSkipDelivery() {
  return useLifecycleMutation(({ id, occurrenceDate }) => subscriptionsApi.skip(id, occurrenceDate!));
}

export function useRunFulfillment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetDate,
      triggeredBy,
      mealSlot,
    }: {
      targetDate?: string;
      triggeredBy?: string;
      mealSlot?: string;
    }) => subscriptionsApi.runFulfillment(targetDate, triggeredBy, mealSlot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-forecast"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-fulfillment-jobs"] });
    },
  });
}

export function useFulfillmentJobs(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin-subscriptions-fulfillment-jobs", page, limit],
    queryFn: () => subscriptionsApi.listFulfillmentJobs(page, limit),
    staleTime: 15_000,
  });
}

export function useRetryFulfillmentJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.retryFulfillmentJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-fulfillment-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    },
  });
}

// ── Subscription Operations ──
export function useOpsDashboard() {
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ["admin-ops-dashboard", branchId],
    queryFn: () => subscriptionsApi.getOpsDashboard(branchId ?? undefined),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

export function useOpsKitchenForecast(date?: string) {
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ["admin-ops-kitchen", date, branchId],
    queryFn: () => subscriptionsApi.getOpsKitchenForecast(date, branchId ?? undefined),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

export function useOpsKitchenRange(from: string, to: string) {
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ["admin-ops-kitchen-range", from, to, branchId],
    queryFn: () => subscriptionsApi.getOpsKitchenForecastRange(from, to, branchId ?? undefined),
    staleTime: 60_000,
  });
}

export function useOpsDeliveryForecast(date?: string) {
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ["admin-ops-delivery", date, branchId],
    queryFn: () => subscriptionsApi.getOpsDeliveryForecast(date, branchId ?? undefined),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

export function useOpsCalendar(year: number, month: number) {
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ["admin-ops-calendar", year, month, branchId],
    queryFn: () => subscriptionsApi.getOpsCalendar(year, month, branchId ?? undefined),
    staleTime: 60_000,
  });
}

export function useOpsAnalytics(days = 30) {
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ["admin-ops-analytics", days, branchId],
    queryFn: () => subscriptionsApi.getOpsAnalytics(days, branchId ?? undefined),
    staleTime: 60_000,
  });
}

export function useOpsAlerts(resolved?: boolean) {
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ["admin-ops-alerts", resolved, branchId],
    queryFn: () => subscriptionsApi.getOpsAlerts(resolved, branchId ?? undefined),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useDetectOpsAlerts() {
  const queryClient = useQueryClient();
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);
  return useMutation({
    mutationFn: () => subscriptionsApi.detectOpsAlerts(branchId ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-ops-alerts"] }),
  });
}

export function useResolveOpsAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.resolveOpsAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-ops-alerts"] }),
  });
}

/** Live updates: connect to the admin:subscriptions room and invalidate caches. */
export function useOpsRealtime() {
  const queryClient = useQueryClient();
  React.useEffect(() => {
    const socket = connectRealtime();
    socket.emit("subscribe", "admin:subscriptions");
    const offUpdate = onRealtime("admin:subscription_ops_update", () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ops-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ops-kitchen"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ops-delivery"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ops-calendar"] });
    });
    const offAlert = onRealtime("admin:subscription_alert", () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ops-alerts"] });
    });
    return () => {
      offUpdate();
      offAlert();
      disconnectRealtime();
    };
  }, [queryClient]);
}
