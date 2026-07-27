import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onRealtime } from "@/lib/realtime/socket";
import { REALTIME_EVENTS, type BranchOrderNewPayload, type BranchOrderUpdatedPayload } from "@/lib/realtime/events";
import { branchIdsMatch } from "@/lib/realtime/branch-id";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { fetchBranchDashboardStats } from "../api/branch-dashboard.api";
import {
  patchBranchDashboardOnNewOrder,
  scheduleBranchDashboardRefresh,
} from "../utils/branch-dashboard-realtime-sync";

/** Shared with BranchOrderAlertProvider for realtime invalidation. */
export const BRANCH_DASHBOARD_STATS_KEY = ["branch-dashboard", "stats"] as const;

const REALTIME_STALE_MS = 5_000;
/** Slow fallback when Socket.IO is offline; realtime invalidates this query. */
const FALLBACK_POLL_MS = 60_000;

/**
 * Dashboard stats with Socket.IO invalidation. BranchOrderAlertProvider handles
 * most events globally; this hook adds a page-local listener so the dashboard
 * refreshes even if the provider remounts late after auth hydration.
 */
export function useBranchDashboard(enabled = true) {
  const qc = useQueryClient();
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const { branchId: workspaceBranchId, isBranchManager } = useWorkspace();
  const userBranchId = useAdminAuthStore((s) => s.user?.branchId ?? s.branchId);
  const branchId = workspaceBranchId ?? userBranchId;

  useEffect(() => {
    if (!enabled || !accessToken || !isBranchManager) return;

    const offNew = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_NEW, (raw) => {
      const payload = raw as BranchOrderNewPayload;
      if (!branchIdsMatch(branchId, payload.branchId)) return;
      patchBranchDashboardOnNewOrder(qc, payload);
      scheduleBranchDashboardRefresh(qc);
    });

    const offUpdated = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_UPDATED, (raw) => {
      const payload = raw as BranchOrderUpdatedPayload;
      if (!branchIdsMatch(branchId, payload.branchId)) return;
      scheduleBranchDashboardRefresh(qc);
    });

    const offKitchenCreated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_CREATED, () => {
      scheduleBranchDashboardRefresh(qc);
    });

    return () => {
      offNew();
      offUpdated();
      offKitchenCreated();
    };
  }, [enabled, accessToken, isBranchManager, branchId, qc]);

  return useQuery({
    queryKey: BRANCH_DASHBOARD_STATS_KEY,
    queryFn: fetchBranchDashboardStats,
    staleTime: REALTIME_STALE_MS,
    refetchInterval: enabled ? FALLBACK_POLL_MS : 0,
    refetchIntervalInBackground: true,
    enabled,
  });
}
