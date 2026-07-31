"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  kitchenSubscriptionsApi,
  type SubscriptionKitchenApiScope,
} from "@/features/kitchen-subscriptions/services/kitchen-subscriptions.api";
import {
  Clock,
  UserCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";

const statCards = [
  { key: "pendingPrep" as const, label: "Pending Prep", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "assigned" as const, label: "Assigned", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "outForDelivery" as const, label: "Out for Delivery", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "delivered" as const, label: "Delivered Today", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  { key: "failed" as const, label: "Failed", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  { key: "cancelledSkipped" as const, label: "Cancelled / Skipped", icon: Ban, color: "text-gray-600", bg: "bg-gray-50" },
];

export function SubscriptionDeliveryStats({
  apiMode = "branch",
  date,
  branchId,
  slotId,
  search,
}: {
  apiMode?: SubscriptionKitchenApiScope;
  date: string;
  branchId?: string;
  slotId?: string;
  search?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["subscription-deliveries", "dashboard", apiMode, date, branchId, slotId, search],
    queryFn: () =>
      kitchenSubscriptionsApi.getDeliveryDashboard(
        {
          date,
          branchId,
          slotId,
          search: search || undefined,
        },
        apiMode,
      ),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.key} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`rounded-lg p-1.5 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground truncate">
                {stat.label}
              </span>
            </div>
            <div className="text-2xl font-bold">{data?.[stat.key] ?? 0}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
