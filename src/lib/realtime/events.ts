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

  BRANCH_ORDER_NEW: "branch:order_new",
  BRANCH_ORDER_UPDATED: "branch:order_updated",

  ADMIN_DELIVERY_UPDATED: "admin:delivery_updated",
  CUSTOMER_DELIVERY_UPDATED: "customer:delivery_updated",
  KITCHEN_DELIVERY_UPDATED: "kitchen:delivery_updated",

  CUSTOMER_ORDER_UPDATED: "customer:order_updated",

  // Subscription kitchen events
  SUBSCRIPTION_ORDER_CREATED: "subscription:order_created",
  SUBSCRIPTION_ORDER_UPDATED: "subscription:order_updated",
  SUBSCRIPTION_BATCH_CREATED: "subscription:batch_created",
  SUBSCRIPTION_DISPATCH_UPDATED: "subscription:dispatch_updated",
  SUBSCRIPTION_BATCH_STATUS: "subscription:batch_status",

  // Dispatch management events
  ADMIN_DISPATCH_BATCH_CREATED: "admin:dispatch_batch_created",
  ADMIN_DISPATCH_BATCH_UPDATED: "admin:dispatch_batch_updated",
  ADMIN_DISPATCH_BATCH_STATUS: "admin:dispatch_batch_status",

  // Dispatch batch auto-advancement from webhooks
  ADMIN_DISPATCH_BATCH_STATUS_UPDATED: "admin:dispatch_batch_status_updated",

  // Customer support alerts
  ADMIN_SUPPORT_TICKET_NEW: "admin:support_ticket_new",
  BRANCH_SUPPORT_TICKET_NEW: "branch:support_ticket_new",
  ADMIN_SUPPORT_TICKET_REPLIED: "admin:support_ticket_replied",
  BRANCH_SUPPORT_TICKET_REPLIED: "branch:support_ticket_replied",
  ADMIN_SUPPORT_TICKET_UPDATED: "admin:support_ticket_updated",
  BRANCH_SUPPORT_TICKET_UPDATED: "branch:support_ticket_updated",
  CUSTOMER_SUPPORT_MESSAGE_UPDATED: "customer:support_message_updated",
  SUPPORT_TICKET_TYPING: "support:ticket_typing",
} as const;

export interface SupportTicketTypingPayload {
  ticketId: string;
  senderType: "CUSTOMER" | "ADMIN";
  isTyping: boolean;
  occurredAt: string;
}

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
  branchId?: string;
  itemsSummary?: string;
  itemCount?: number;
  grandTotal?: number;
  paymentMethod?: string;
  deliveryType?: string;
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
  branchId?: string;
  itemsSummary?: string;
  itemCount?: number;
  grandTotal?: number;
}

export interface BranchOrderNewPayload extends AdminOrderCreatedPayload {
  branchId: string;
  itemsSummary: string;
  itemCount: number;
  grandTotal: number;
  paymentMethod?: string;
  deliveryType?: string;
}

export interface BranchOrderUpdatedPayload extends AdminOrderUpdatedPayload {
  branchId: string;
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

export interface AdminSupportTicketNewPayload {
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  branchId: string | null;
  category: string;
  priority: string;
  subject: string;
  status: string;
  occurredAt: string;
}

export interface AdminSupportTicketRepliedPayload {
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  branchId: string | null;
  subject: string;
  messagePreview: string;
  occurredAt: string;
}

export interface AdminSupportTicketUpdatedPayload {
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  branchId: string | null;
  status: string;
  senderType?: "CUSTOMER" | "ADMIN" | "SYSTEM";
  messagePreview?: string;
  occurredAt: string;
}
