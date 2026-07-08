export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'authorized' | 'refunded' | 'cancelled';

export type PaymentMethodType = 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'wallet' | 'cod';

export type PaymentGateway = 'razorpay';

export type DateFilter = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom';

export type CodCollectionStatus = 'collected' | 'pending' | 'failed_collection';

export interface RazorpayInfo {
  orderId: string;
  paymentId: string;
  gateway: PaymentGateway;
  paymentMethod: string;
  bank?: string;
  upiApp?: string;
  cardNetwork?: string;
  maskedCardNumber?: string;
  transactionReference: string;
  webhookStatus: 'processed' | 'pending' | 'error';
}

export interface PaymentTimelineEvent {
  id: string;
  type: 'order_created' | 'payment_initiated' | 'payment_authorized' | 'payment_successful' | 'order_accepted' | 'preparing' | 'out_for_delivery' | 'delivered';
  label: string;
  timestamp: number;
  status: 'completed' | 'current' | 'upcoming';
}

export interface PaymentOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  paymentId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  gateway: PaymentGateway;
  transactionTime: number;
  items: PaymentOrderItem[];
  subtotal: number;
  deliveryCharges: number;
  discount: number;
  gst: number;
  grandTotal: number;
  deliverySlot: string;
  orderStatus: string;
  deliveryAddress: string;
  razorpayInfo: RazorpayInfo | null;
  timeline: PaymentTimelineEvent[];
}

export interface CodRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  collectionStatus: CodCollectionStatus;
  collectedBy: string;
  collectionTime: number | null;
  remarks: string;
  orderDate: number;
}

export interface FailedPayment {
  id: string;
  paymentId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  failureReason: string;
  paymentMethod: PaymentMethodType;
  retryStatus: 'not_retried' | 'retried' | 'retry_succeeded';
  transactionTime: number;
}

export interface PaymentFilters {
  search: string;
  status: PaymentStatus | 'all';
  method: PaymentMethodType | 'all';
  gateway: PaymentGateway | 'all';
  dateFilter: DateFilter;
  customDateFrom: string;
  customDateTo: string;
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  paid: { label: 'Paid', color: 'text-emerald-700', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-500' },
  pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-50', dotColor: 'bg-amber-500' },
  failed: { label: 'Failed', color: 'text-red-700', bgColor: 'bg-red-50', dotColor: 'bg-red-500' },
  authorized: { label: 'Authorized', color: 'text-blue-700', bgColor: 'bg-blue-50', dotColor: 'bg-blue-500' },
  refunded: { label: 'Refunded', color: 'text-violet-700', bgColor: 'bg-violet-50', dotColor: 'bg-violet-500' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-400' },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethodType, { label: string; icon: string }> = {
  upi: { label: 'UPI', icon: 'Smartphone' },
  credit_card: { label: 'Credit Card', icon: 'CreditCard' },
  debit_card: { label: 'Debit Card', icon: 'CreditCard' },
  net_banking: { label: 'Net Banking', icon: 'Building2' },
  wallet: { label: 'Wallet', icon: 'Wallet' },
  cod: { label: 'Cash on Delivery', icon: 'Banknote' },
};

export const COD_COLLECTION_STATUS_CONFIG: Record<CodCollectionStatus, { label: string; color: string; bgColor: string }> = {
  collected: { label: 'Collected', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  failed_collection: { label: 'Failed Collection', color: 'text-red-700', bgColor: 'bg-red-50' },
};
