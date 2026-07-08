"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Truck, MapPin, Clock } from "lucide-react";
import { useReportsStore } from "../hooks/useReports";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900">{payload[0].value.toLocaleString()} orders</p>
    </div>
  );
}

export function DeliveryAnalytics() {
  const data = useReportsStore((s) => s.data.deliveryAnalytics);
  const popularSlots = useReportsStore((s) => s.data.popularSlots);

  const maxSlot = useMemo(
    () => popularSlots.reduce((max, s) => (s.orders > max.orders ? s : max), popularSlots[0]),
    [popularSlots]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Truck className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Delivery Analytics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5">
            <span className="text-xs text-gray-500">Lunch Orders</span>
            <span className="text-sm font-bold text-gray-900">{data.lunchOrders.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5">
            <span className="text-xs text-gray-500">Dinner Orders</span>
            <span className="text-sm font-bold text-gray-900">{data.dinnerOrders.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5">
            <span className="text-xs text-gray-500">Avg Delivery Time</span>
            <span className="text-sm font-bold text-gray-900">{data.avgDeliveryTime} min</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5">
            <span className="text-xs text-gray-500">Peak Slot</span>
            <span className="text-xs font-bold text-gray-900">{data.peakDeliverySlot}</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Popular Slots</h4>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularSlots} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="slot" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {popularSlots.map((entry, idx) => (
                    <motion.rect key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <MapPin className="h-3 w-3" /> Pincode Distribution
        </h4>
        <div className="space-y-2">
          {data.pincodeDistribution.slice(0, 4).map((p, i) => (
            <div key={p.pincode} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-16">{p.pincode}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.percentage}%` }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-10 text-right">{p.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
