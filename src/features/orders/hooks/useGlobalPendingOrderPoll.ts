"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { kitchenApi } from "@/lib/api/kitchen.api";
import { branchIdsMatch } from "@/lib/realtime/branch-id";
import { getAlertSessionStart } from "@/lib/realtime/alert-session";
import type { BranchOrderNewPayload } from "@/lib/realtime/events";
import { kitchenItemToAlertPayload } from "../utils/pending-order-alert";

const POLL_MS_DEFAULT = 5_000;
const POLL_MS_SOCKET_OFFLINE = 2_000;

export const GLOBAL_PENDING_ORDER_ALERTS_KEY = ["branch-manager", "global-pending-order-alerts"] as const;

/**
 * Polls pending kitchen tickets on every branch-manager page so new-order
 * popup + sound fire even when Socket.IO is offline or the manager is not
 * on the kitchen board.
 */
export function useGlobalPendingOrderPoll(
  enabled: boolean,
  branchId: string | null | undefined,
  onNewPendingOrder: (payload: BranchOrderNewPayload) => void,
  options?: { socketConnected?: boolean },
) {
  const qc = useQueryClient();
  const pollMs =
    options?.socketConnected === false ? POLL_MS_SOCKET_OFFLINE : POLL_MS_DEFAULT;
  const onAlertRef = useRef(onNewPendingOrder);
  onAlertRef.current = onNewPendingOrder;

  const pollSeen = useRef<Set<string>>(new Set());
  const bootstrapped = useRef(false);
  const socketWasConnected = useRef(options?.socketConnected ?? false);

  const query = useQuery({
    queryKey: [...GLOBAL_PENDING_ORDER_ALERTS_KEY, branchId],
    queryFn: () =>
      kitchenApi.listOrders({
        status: "PENDING",
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: enabled && !!branchId,
    refetchInterval: pollMs,
    refetchIntervalInBackground: true,
    staleTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    const connected = options?.socketConnected ?? false;
    if (connected && !socketWasConnected.current) {
      void qc.invalidateQueries({ queryKey: [...GLOBAL_PENDING_ORDER_ALERTS_KEY, branchId] });
    }
    socketWasConnected.current = connected;
  }, [options?.socketConnected, branchId, qc]);

  useEffect(() => {
    const items = query.data?.items;
    if (!items?.length) {
      if (query.isSuccess) {
        bootstrapped.current = true;
      }
      return;
    }

    const sessionStartedAt = getAlertSessionStart();

    if (!bootstrapped.current) {
      for (const item of items) {
        if (item.kitchenStatus !== "PENDING") continue;
        const createdMs = new Date(item.orderCreatedAt).getTime();
        if (createdMs < sessionStartedAt) {
          pollSeen.current.add(item.orderId);
        }
      }
      bootstrapped.current = true;
    }

    for (const item of items) {
      if (item.kitchenStatus !== "PENDING") continue;
      if (pollSeen.current.has(item.orderId)) continue;
      pollSeen.current.add(item.orderId);

      const payload = kitchenItemToAlertPayload(item, branchId);
      if (branchId && payload.branchId && !branchIdsMatch(branchId, payload.branchId)) continue;

      onAlertRef.current(payload);
    }
  }, [query.data?.items, query.isSuccess, branchId]);

  return query;
}
