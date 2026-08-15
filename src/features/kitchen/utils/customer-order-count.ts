import type { QueryClient } from "@tanstack/react-query";
import type { KitchenOrderListResponse } from "@/lib/api/kitchen.api";
import type { KitchenOrderView } from "../types/kitchen";
import { KITCHEN_QUERY_KEY } from "./kitchen-realtime-sync";

export function formatCustomerOrderCountLabel(count: number, customerName: string): string | null {
  if (count <= 1) return null;
  return `${count} orders by ${customerName}`;
}

export function buildCustomerActiveOrderCounts(
  orders: KitchenOrderView[],
): Map<string, { count: number; name: string }> {
  const map = new Map<string, { count: number; name: string }>();
  for (const order of orders) {
    const customerId = order.customer?.id;
    if (!customerId) continue;
    const name = order.customer?.name ?? "Guest";
    const existing = map.get(customerId);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(customerId, { count: 1, name });
    }
  }
  return map;
}

export function countActiveKitchenOrdersForCustomer(
  qc: QueryClient,
  customerId: string | undefined,
  includeOrderId?: string,
): number {
  if (!customerId) return 0;

  const queries = qc.getQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY });
  const seen = new Set<string>();
  let count = 0;

  for (const [, data] of queries) {
    for (const item of data?.items ?? []) {
      if (item.customer?.id === customerId && !seen.has(item.orderId)) {
        seen.add(item.orderId);
        count += 1;
      }
    }
  }

  if (includeOrderId && !seen.has(includeOrderId)) {
    count += 1;
  }

  return count;
}
