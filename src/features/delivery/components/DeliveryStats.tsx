"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { deliveryApi } from "../services/delivery.api";
import { branchDeliveryApi } from "../services/branch-delivery.api";
import {
  Clock,
  UserCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statCards = [
  { key: "pendingPickups" as const, label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "assignedRiders" as const, label: "Assigned", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "inTransit" as const, label: "In Transit", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "deliveredToday" as const, label: "Delivered", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  { key: "failed" as const, label: "Failed", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  { key: "cancelled" as const, label: "Cancelled", icon: Ban, color: "text-gray-600", bg: "bg-gray-50" },
];

export function DeliveryStats({
  apiMode = "admin",
  branchId,
}: {
  apiMode?: "admin" | "branch";
  branchId?: string;
}) {
  const api = apiMode === "branch" ? branchDeliveryApi : deliveryApi;
  const { data, isLoading } = useQuery({
    queryKey: ["deliveries", "dashboard", apiMode, branchId],
    queryFn: () => api.getDashboard(branchId),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {statCards.map((stat) => (
        <div
          key={stat.key}
          className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5"
        >
          <div className={cn("rounded p-1.5", stat.bg)}>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-gray-500">{stat.label}</p>
            <p className="text-base font-bold leading-tight text-gray-900">{data?.[stat.key] ?? 0}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
