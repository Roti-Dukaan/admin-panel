export type DocumentType = "INVOICE" | "KITCHEN_TICKET" | "DELIVERY_LABEL";

export interface DocumentLineItem {
  lineNumber: number;
  name: string;
  variant: string;
  quantity: number;
}

export interface KitchenTicketData {
  type: "KITCHEN_TICKET";
  orderId: string;
  orderNumber: string;
  orderType: "Live" | "Subscription";
  orderDate: string;
  orderTime: string;
  deliveryType: string;
  deliverySlot: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  paymentMethod: string;
  items: DocumentLineItem[];
  specialInstructions?: string[];
  printedAt: string;
}

export interface DeliveryLabelData {
  type: "DELIVERY_LABEL";
  orderId: string;
  orderNumber: string;
  orderType: "Live" | "Subscription";
  orderDate: string;
  orderTime: string;
  deliveryType: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliverySlot: string;
  branchName?: string | null;
  itemCount: number;
  grandTotal: number;
  itemsSummary: string[];
  paymentMethod: string;
  paymentStatus: "PAID" | "COD";
  collectAmount?: number | null;
  printedAt: string;
}

export type PrintableDocumentData = KitchenTicketData | DeliveryLabelData;
