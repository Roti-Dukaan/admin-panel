"use client";

import { motion } from "motion/react";
import { User, Phone, Mail, MapPin } from "lucide-react";
import type { Payment } from "../types/payment";

export function CustomerCard({ payment }: { payment: Payment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Customer Information</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">
            {payment.customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{payment.customerName}</p>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{payment.customerPhone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{payment.customerEmail}</span>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{payment.deliveryAddress}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
