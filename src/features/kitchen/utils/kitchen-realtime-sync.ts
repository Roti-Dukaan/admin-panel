import type { QueryClient } from "@tanstack/react-query";
import type {
  KitchenOrderListResponse,
  KitchenOrderDetail,
  KitchenStage,
} from "@/lib/api/kitchen.api";
import type {
  BranchOrderNewPayload,
  KitchenTicketCreatedPayload,
  KitchenTicketUpdatedPayload,
  DeliveryUpdatedPayload,
} from "@/lib/realtime/events";
import {
  patchKitchenDetailMapStage,
  patchKitchenListStage,
  pickLaterKitchenStage,
} from "./kitchen-cache";

export const KITCHEN_QUERY_KEY = ["kitchen", "orders"] as const;
export const KITCHEN_DETAIL_QUERY_KEY = ["kitchen", "details"] as const;

const seenEventKeys = new Set<string>();

function isNewEvent(key: string): boolean {
  if (seenEventKeys.has(key)) return false;
  seenEventKeys.add(key);
  if (seenEventKeys.size > 300) seenEventKeys.clear();
  return true;
}

function minimalListItem(
  payload: KitchenTicketCreatedPayload,
): KitchenOrderListResponse["items"][0] {
  return {
    orderId: payload.orderId,
    ticketId: payload.ticketId,
    ticketNumber: payload.ticketNumber,
    orderNumber: payload.orderNumber,
    kitchenStatus: "PENDING",
    stageLabel: "New Orders",
    priority: "NORMAL",
    customer: null,
    itemsCount: 0,
    totalQuantity: 0,
    deliveryType: "DELIVERY",
    orderCreatedAt: payload.occurredAt,
    timer: {
      elapsedMinutes: 0,
      preparingMinutes: null,
      readyDurationMinutes: null,
      isReady: false,
    },
  };
}

function branchOrderPlaceholder(
  payload: BranchOrderNewPayload,
): KitchenOrderListResponse["items"][0] {
  return {
    orderId: payload.orderId,
    ticketId: `pending:${payload.orderId}`,
    ticketNumber: payload.orderNumber,
    orderNumber: payload.orderNumber,
    kitchenStatus: "PENDING",
    stageLabel: "New Orders",
    priority: "NORMAL",
    customer: null,
    itemsCount: payload.itemCount ?? 0,
    totalQuantity: payload.itemCount ?? 0,
    deliveryType: "DELIVERY",
    orderCreatedAt: payload.occurredAt,
    timer: {
      elapsedMinutes: 0,
      preparingMinutes: null,
      readyDurationMinutes: null,
      isReady: false,
    },
  };
}

/** Prepend a new ticket to every cached kitchen list query. */
export function prependKitchenTicket(
  qc: QueryClient,
  payload: KitchenTicketCreatedPayload,
): void {
  const key = `created:${payload.orderId}:${payload.occurredAt}`;
  if (!isNewEvent(key)) return;

  qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) => {
    const item = minimalListItem(payload);
    if (!old) {
      return {
        items: [item],
        total: 1,
        page: 1,
        limit: 300,
        totalPages: 1,
      };
    }
    const existingIndex = old.items.findIndex((it) => it.orderId === payload.orderId);
    if (existingIndex >= 0) {
      const items = [...old.items];
      items[existingIndex] = { ...items[existingIndex], ...item };
      return { ...old, items };
    }
    return { ...old, items: [item, ...old.items], total: old.total + 1 };
  });
}

/** Optimistic row from branch:order_new — ticket may not exist in the API yet. */
export function prependBranchOrderPlaceholder(
  qc: QueryClient,
  payload: BranchOrderNewPayload,
): void {
  const key = `branch-new:${payload.orderId}:${payload.occurredAt}`;
  if (!isNewEvent(key)) return;

  qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) => {
    const item = branchOrderPlaceholder(payload);
    if (!old) {
      return {
        items: [item],
        total: 1,
        page: 1,
        limit: 300,
        totalPages: 1,
      };
    }
    if (old.items.some((it) => it.orderId === payload.orderId)) return old;
    return { ...old, items: [item, ...old.items], total: old.total + 1 };
  });
}

export function patchKitchenStageInCache(
  qc: QueryClient,
  orderId: string,
  stage: KitchenStage,
  occurredAt: string,
): void {
  qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) =>
    patchKitchenListStage(old, orderId, stage, occurredAt),
  );
  qc.setQueriesData<Record<string, KitchenOrderDetail>>({ queryKey: KITCHEN_DETAIL_QUERY_KEY }, (old) => {
    if (!old?.[orderId]) return old;
    const kitchenStatus = pickLaterKitchenStage(old[orderId].kitchenStatus, stage);
    return {
      ...old,
      [orderId]: {
        ...old[orderId],
        kitchenStatus,
        startedPreparingAt:
          kitchenStatus === "PREPARING" ? occurredAt : old[orderId].startedPreparingAt,
        readyAt: kitchenStatus === "READY_FOR_PICKUP" ? occurredAt : old[orderId].readyAt,
      },
    };
  });
}

export function removeDeliveredKitchenOrder(qc: QueryClient, orderId: string): void {
  qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) => {
    if (!old) return old;
    if (!old.items.some((it) => it.orderId === orderId)) return old;
    return {
      ...old,
      items: old.items.filter((it) => it.orderId !== orderId),
      total: Math.max(0, old.total - 1),
    };
  });
}

/** Background enrich for active kitchen list observers — no invalidate (keeps optimistic rows). */
export function refetchKitchenQueries(qc: QueryClient): void {
  void qc.refetchQueries({ queryKey: KITCHEN_QUERY_KEY, type: "active" });
  void qc.refetchQueries({ queryKey: KITCHEN_DETAIL_QUERY_KEY, type: "active" });
}

let kitchenRefreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced background enrich — list is already updated optimistically. */
export function scheduleKitchenRefresh(qc: QueryClient, delayMs = 2000): void {
  if (kitchenRefreshTimer) clearTimeout(kitchenRefreshTimer);
  kitchenRefreshTimer = setTimeout(() => {
    kitchenRefreshTimer = null;
    refetchKitchenQueries(qc);
  }, delayMs);
}

export function handleKitchenTicketCreated(qc: QueryClient, payload: KitchenTicketCreatedPayload): void {
  prependKitchenTicket(qc, payload);
  refetchKitchenQueries(qc);
  scheduleKitchenRefresh(qc, 2000);
}

export function handleKitchenTicketUpdated(
  qc: QueryClient,
  payload: KitchenTicketUpdatedPayload,
): void {
  const key = `updated:${payload.orderId}:${payload.occurredAt}`;
  if (!isNewEvent(key)) return;
  patchKitchenStageInCache(qc, payload.orderId, payload.stage, payload.occurredAt);
}

export function handleBranchOrderNew(qc: QueryClient, payload: BranchOrderNewPayload): void {
  prependBranchOrderPlaceholder(qc, payload);
  refetchKitchenQueries(qc);
}

export function handleKitchenDeliveryUpdated(
  qc: QueryClient,
  payload: DeliveryUpdatedPayload,
): void {
  if (payload.status === "DELIVERED") {
    removeDeliveredKitchenOrder(qc, payload.orderId);
  }
}
