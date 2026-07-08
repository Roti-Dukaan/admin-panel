"use client";

import { useMemo } from "react";
import { Users, UserCheck, UserX, Repeat, Crown, ShoppingCart } from "lucide-react";
import { useCustomerStore } from "../hooks/useCustomers";

const statCards = [
  { key: "total" as const, label: "Total Customers", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "active" as const, label: "Active", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "inactive" as const, label: "Inactive", icon: UserX, color: "text-red-600", bg: "bg-red-50" },
  { key: "subscribers" as const, label: "Subscribers", icon: Repeat, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "repeatCustomers" as const, label: "Repeat Orders", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "vipCustomers" as const, label: "VIP Customers", icon: Crown, color: "text-orange-600", bg: "bg-orange-50" },
];

export function CustomersStats() {
  const getStats = useCustomerStore((s) => s.getStats);
  const stats = useMemo(() => getStats(), [getStats]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {statCards.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key];
        return (
          <div
            key={card.key}
            className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs font-medium text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
