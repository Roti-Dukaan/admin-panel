/** Realtime event names + payloads shared with the backend Socket.IO layer. */

export const REALTIME_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  PING: "ping",
  PONG: "pong",
  ERROR: "exception",

  KITCHEN_TICKET_CREATED: "kitchen:ticket_created",
  KITCHEN_TICKET_UPDATED: "kitchen:ticket_updated",

  ADMIN_ORDER_CREATED: "admin:order_created",
  ADMIN_ORDER_UPDATED: "admin:order_updated",

  ADMIN_DELIVERY_UPDATED: "admin:delivery_updated",
  CUSTOMER_DELIVERY_UPDATED: "customer:delivery_updated",
  KITCHEN_DELIVERY_UPDATED: "kitchen:delivery_updated",

  CUSTOMER_ORDER_UPDATED: "customer:order_updated",
} as const;

export interface KitchenTicketCreatedPayload {
  ticketId: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  stage: "PENDING";
  occurredAt: string;
  actorType: "SYSTEM" | "ADMIN";
  actorId: string;
}

export interface KitchenTicketUpdatedPayload {
  ticketId: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  stage: "PREPARING" | "READY_FOR_PICKUP";
  occurredAt: string;
  actorType: "SYSTEM" | "ADMIN";
  actorId: string;
}

export interface AdminOrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  status: string;
  occurredAt: string;
}

export interface AdminOrderUpdatedPayload {
  orderId: string;
  orderNumber: string;
  status: string;
  previousStatus?: string;
  occurredAt: string;
}

export interface DeliveryUpdatedPayload {
  deliveryId: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  deliveryType: string;
  status: string;
  previousStatus: string | null;
  occurredAt: string;
  actorType: "SYSTEM" | "ADMIN" | "CUSTOMER" | "PROVIDER";
  actorId: string;
  remarks?: string | null;
}
