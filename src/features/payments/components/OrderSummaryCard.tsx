"use client";

import { motion } from "motion/react";
import { Receipt, Truck, Percent, FileText } from "lucide-react";
import type { Payment } from "../types/payment";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function OrderSummaryCard({ payment }: { payment: Payment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
          <Receipt className="h-4 w-4 text-orange-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Order Information</h3>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {payment.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {item.name} <span className="text-gray-400">x{item.quantity}</span>
            </span>
            <span className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-700">{formatCurrency(payment.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            <Truck className="h-3 w-3" /> Delivery
          </span>
          <span className="font-medium text-gray-700">{formatCurrency(payment.deliveryCharges)}</span>
        </div>
        {payment.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <Percent className="h-3 w-3" /> Discount
            </span>
            <span className="font-medium text-emerald-600">-{formatCurrency(payment.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            <FileText className="h-3 w-3" /> GST (5%)
          </span>
          <span className="font-medium text-gray-700">{formatCurrency(payment.gst)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between">
          <span className="text-sm font-bold text-gray-900">Grand Total</span>
          <span className="text-sm font-bold text-gray-900">{formatCurrency(payment.grandTotal)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-500">Delivery Slot</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.deliverySlot}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-500">Order Status</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{payment.orderStatus}</p>
        </div>
      </div>
    </motion.div>
  );
}
