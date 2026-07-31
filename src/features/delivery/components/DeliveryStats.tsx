"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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

const statCards = [
  { key: "pendingPickups" as const, label: "Pending Pickups", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "assignedRiders" as const, label: "Assigned Riders", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "inTransit" as const, label: "In Transit", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "deliveredToday" as const, label: "Delivered Today", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
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
