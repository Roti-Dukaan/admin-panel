import type { QueryClient } from "@tanstack/react-query";
import type { BranchOrderNewPayload } from "@/lib/realtime/events";
import { BRANCH_DASHBOARD_STATS_KEY } from "../hooks/useBranchDashboard";
import type { BranchDashboardStats } from "../types/dashboard";

/** Optimistic bump so dashboard cards update before the stats API refetch. */
export function patchBranchDashboardOnNewOrder(qc: QueryClient, _payload: BranchOrderNewPayload): void {
  let patched = false;

  qc.setQueriesData<BranchDashboardStats>({ queryKey: BRANCH_DASHBOARD_STATS_KEY }, (old) => {
    if (!old) return old;
    patched = true;
    return {
      ...old,
      totalOrdersToday: old.totalOrdersToday + 1,
      pendingOrders: (old.pendingOrders ?? 0) + 1,
      activeTickets: (old.activeTickets ?? 0) + 1,
    };
  });

  // Stats query may not be cached yet (dashboard still loading) — force a fetch.
  if (!patched) {
    void qc.invalidateQueries({ queryKey: BRANCH_DASHBOARD_STATS_KEY });
  }
}

/** Debounced background refetch — list counts are patched optimistically first. */
let dashboardRefreshTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleBranchDashboardRefresh(qc: QueryClient, delayMs = 400): void {
  if (dashboardRefreshTimer) return;

  dashboardRefreshTimer = setTimeout(() => {
    dashboardRefreshTimer = null;
    void qc.invalidateQueries({ queryKey: BRANCH_DASHBOARD_STATS_KEY });
    void qc.refetchQueries({ queryKey: BRANCH_DASHBOARD_STATS_KEY, type: "active" });
  }, delayMs);
}
