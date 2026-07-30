import type { BranchOrderNewPayload } from "./events";

const CHANNEL_NAME = "roti-branch-order-alert";

type OrderAlertMessage =
  | { type: "new_order"; payload: BranchOrderNewPayload; sourceId: string }
  | { type: "dismiss_order"; orderId: string; sourceId: string };

let tabId: string | null = null;

function getTabId(): string {
  if (tabId) return tabId;
  tabId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return tabId;
}

/** Notify other tabs in the same browser session about a new order alert. */
export function broadcastNewOrderAlert(payload: BranchOrderNewPayload): void {
  if (typeof BroadcastChannel === "undefined") return;
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const message: OrderAlertMessage = {
      type: "new_order",
      payload,
      sourceId: getTabId(),
    };
    channel.postMessage(message);
    channel.close();
  } catch {
    /* ignore */
  }
}

/** Notify other tabs that an order alert was handled so they can stop ringing. */
export function broadcastDismissOrderAlert(orderId: string): void {
  if (typeof BroadcastChannel === "undefined") return;
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const message: OrderAlertMessage = {
      type: "dismiss_order",
      orderId,
      sourceId: getTabId(),
    };
    channel.postMessage(message);
    channel.close();
  } catch {
    /* ignore */
  }
}

export function subscribeOrderAlertBroadcast(handlers: {
  onNewOrder: (payload: BranchOrderNewPayload) => void;
  onDismissOrder: (orderId: string) => void;
}): () => void {
  if (typeof BroadcastChannel === "undefined") return () => undefined;

  const channel = new BroadcastChannel(CHANNEL_NAME);
  const selfId = getTabId();

  channel.onmessage = (event: MessageEvent<OrderAlertMessage>) => {
    const data = event.data;
    if (!data || data.sourceId === selfId) return;

    if (data.type === "new_order") {
      handlers.onNewOrder(data.payload);
    } else if (data.type === "dismiss_order") {
      handlers.onDismissOrder(data.orderId);
    }
  };

  return () => channel.close();
}
