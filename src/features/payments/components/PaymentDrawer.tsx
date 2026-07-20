"use client";

import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Copy } from "lucide-react";
import { usePaymentStore } from "../hooks/usePayments";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { CustomerCard } from "./CustomerCard";
import { GatewayCard } from "./GatewayCard";
import { PaymentTimeline } from "./PaymentTimeline";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { InvoiceCard } from "@/features/orders/components/InvoiceCard";
import { PAYMENT_METHOD_CONFIG } from "../types/payment";
import { toast } from "sonner";
import type { Payment } from "../types/payment";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function PaymentDrawer() {
  const { drawerOpen, selectedPayment, closePaymentDrawer } = usePaymentStore();

  const handleClose = () => closePaymentDrawer();

  const payment = selectedPayment;

  return (
    <Drawer open={drawerOpen} onOpenChange={handleClose}>
      {payment && (
        <div className="flex h-full flex-col">
          <DrawerHeader>
            <div className="flex items-center gap-3">
              <DrawerTitle className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">Payment</span>
                <span className="font-mono text-sm text-gray-500">{payment.paymentId}</span>
              </DrawerTitle>
              <PaymentStatusBadge status={payment.paymentStatus} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(payment.paymentId);
                  toast.success("Payment ID copied!");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
                Copy ID
              </button>
              <DrawerClose onClick={handleClose} />
            </div>
          </DrawerHeader>

          <DrawerContent className="space-y-6">
            {/* Payment Summary */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[11px] font-medium text-gray-500">Payment ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 mt-0.5">{payment.paymentId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500">Order ID</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.orderId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500">Status</p>
                  <div className="mt-1"><PaymentStatusBadge status={payment.paymentStatus} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[11px] font-medium text-gray-500">Customer</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.customerName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{PAYMENT_METHOD_CONFIG[payment.paymentMethod]?.label}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500">Gateway</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{payment.gateway}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500">Transaction Time</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateTime(payment.transactionTime)}</p>
                </div>
              </div>
            </div>

            <PaymentTimeline events={payment.timeline} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OrderSummaryCard payment={payment} />
              <CustomerCard payment={payment} />
            </div>

            {payment.razorpayInfo && <GatewayCard payment={payment} />}

            <InvoiceCard orderId={payment.orderId} />
          </DrawerContent>
        </div>
      )}
    </Drawer>
  );
}
