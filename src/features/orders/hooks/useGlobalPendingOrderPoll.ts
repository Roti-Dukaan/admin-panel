"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { kitchenApi } from "@/lib/api/kitchen.api";
import { branchIdsMatch } from "@/lib/realtime/branch-id";
import type { BranchOrderNewPayload } from "@/lib/realtime/events";
import { kitchenItemToAlertPayload } from "../utils/pending-order-alert";

const POLL_MS = 5_000;

/**
 * Polls pending kitchen tickets on every branch-manager page so new-order
 * popup + sound fire even when Socket.IO is offline or the manager is not
 * on the kitchen board.
 */
export function useGlobalPendingOrderPoll(
  enabled: boolean,
  branchId: string | null | undefined,
  onNewPendingOrder: (payload: BranchOrderNewPayload) => void,
) {
  const onAlertRef = useRef(onNewPendingOrder);
  onAlertRef.current = onNewPendingOrder;

  const pollSeen = useRef<Set<string>>(new Set());
  const bootstrapped = useRef(false);

  const query = useQuery({
    queryKey: ["branch-manager", "global-pending-order-alerts", branchId],
    queryFn: () =>
      kitchenApi.listOrders({
        status: "PENDING",
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: enabled && !!branchId,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
    staleTime: POLL_MS,
  });

  useEffect(() => {
    const items = query.data?.items;
    if (!items?.length) return;

    if (!bootstrapped.current) {
      for (const item of items) {
        if (item.kitchenStatus === "PENDING") {
          pollSeen.current.add(item.orderId);
        }
      }
      bootstrapped.current = true;
      return;
    }

    for (const item of items) {
      if (item.kitchenStatus !== "PENDING") continue;
      if (pollSeen.current.has(item.orderId)) continue;
      pollSeen.current.add(item.orderId);

      const payload = kitchenItemToAlertPayload(item, branchId);
      if (branchId && payload.branchId && !branchIdsMatch(branchId, payload.branchId)) continue;

      onAlertRef.current(payload);
    }
  }, [query.data?.items, branchId]);

  return query;
}
