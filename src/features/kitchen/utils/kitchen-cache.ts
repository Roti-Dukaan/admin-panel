import type {
  KitchenStage,
  KitchenOrderListResponse,
  KitchenOrderDetail,
  KitchenStageUpdateResponse,
} from "@/lib/api/kitchen.api";

/** Monotonic stage ordering — never downgrade when merging cache vs stale refetches. */
const STAGE_RANK: Record<KitchenStage, number> = {
  PENDING: 0,
  PREPARING: 1,
  READY_FOR_PICKUP: 2,
};

function stageRank(stage: KitchenStage): number {
  return STAGE_RANK[stage] ?? 0;
}

/** Pick the later kitchen stage and keep timestamps from the winning side. */
export function pickLaterKitchenStage(
  current: KitchenStage,
  incoming: KitchenStage,
): KitchenStage {
  return stageRank(incoming) > stageRank(current) ? incoming : current;
}

/** Patch one order's stage across every cached kitchen list query. */
export function patchKitchenListStage(
  lists: KitchenOrderListResponse | undefined,
  orderId: string,
  stage: KitchenStage,
  occurredAt: string,
): KitchenOrderListResponse | undefined {
  if (!lists) return lists;
  return {
    ...lists,
    items: lists.items.map((item) => {
      if (item.orderId !== orderId) return item;
      const kitchenStatus = pickLaterKitchenStage(item.kitchenStatus, stage);
      return {
        ...item,
        kitchenStatus,
        startedPreparingAt:
          kitchenStatus === "PREPARING"
            ? occurredAt
            : item.startedPreparingAt,
        readyAt: kitchenStatus === "READY_FOR_PICKUP" ? occurredAt : item.readyAt,
      };
    }),
  };
}

/**
 * Merge a refetched list into cached data without downgrading stages that were
 * optimistically advanced (or confirmed) while the fetch was in flight.
 */
export function mergeKitchenListResponses(
  cached: KitchenOrderListResponse | undefined,
  fetched: KitchenOrderListResponse,
): KitchenOrderListResponse {
  if (!cached) return fetched;

  const fetchedOrderIds = new Set(fetched.items.map((item) => item.orderId));
  const cachedByOrderId = new Map(cached.items.map((item) => [item.orderId, item]));

  const mergedFetched = fetched.items.map((item) => {
    const prev = cachedByOrderId.get(item.orderId);
    if (!prev) return item;

    const kitchenStatus = pickLaterKitchenStage(prev.kitchenStatus, item.kitchenStatus);
    if (kitchenStatus === prev.kitchenStatus && kitchenStatus !== item.kitchenStatus) {
      return {
        ...item,
        kitchenStatus: prev.kitchenStatus,
        startedPreparingAt: prev.startedPreparingAt ?? item.startedPreparingAt,
        readyAt: prev.readyAt ?? item.readyAt,
      };
    }
    return item;
  });

  // Keep optimistic PENDING rows until the list API catches up (socket arrives
  // before the ticket is queryable, or a refetch was already in flight).
  const pendingOnly = cached.items.filter(
    (item) => !fetchedOrderIds.has(item.orderId) && item.kitchenStatus === "PENDING",
  );

  if (pendingOnly.length === 0) {
    return { ...fetched, items: mergedFetched };
  }

  return {
    ...fetched,
    items: [...pendingOnly, ...mergedFetched],
    total: fetched.total + pendingOnly.length,
  };
}

/** Confirm a stage mutation in the batch detail map cache. */
export function patchKitchenDetailMapStage(
  map: Record<string, KitchenOrderDetail> | undefined,
  update: KitchenStageUpdateResponse,
): Record<string, KitchenOrderDetail> | undefined {
  if (!map) return map;
  const detail = map[update.orderId];
  if (!detail) return map;

  const kitchenStatus = pickLaterKitchenStage(detail.kitchenStatus, update.stage);
  return {
    ...map,
    [update.orderId]: {
      ...detail,
      kitchenStatus,
      startedPreparingAt:
        kitchenStatus === "PREPARING"
          ? update.occurredAt
          : detail.startedPreparingAt,
      readyAt:
        kitchenStatus === "READY_FOR_PICKUP" ? update.occurredAt : detail.readyAt,
    },
  };
}
