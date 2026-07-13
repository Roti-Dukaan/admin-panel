"use client";

import type { DeliveryStatus, DeliveryProvider } from "@/features/delivery/types/delivery";

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  PENDING: { label: "Pending", bgClass: "bg-amber-100", textClass: "text-amber-800", dotClass: "bg-amber-500" },
  ASSIGNED: { label: "Assigned", bgClass: "bg-blue-100", textClass: "text-blue-800", dotClass: "bg-blue-500" },
  PICKED_UP: { label: "Picked Up", bgClass: "bg-purple-100", textClass: "text-purple-800", dotClass: "bg-purple-500" },
  IN_TRANSIT: { label: "In Transit", bgClass: "bg-indigo-100", textClass: "text-indigo-800", dotClass: "bg-indigo-500" },
  DELIVERED: { label: "Delivered", bgClass: "bg-emerald-100", textClass: "text-emerald-800", dotClass: "bg-emerald-500" },
  FAILED: { label: "Failed", bgClass: "bg-red-100", textClass: "text-red-800", dotClass: "bg-red-500" },
  CANCELLED: { label: "Cancelled", bgClass: "bg-gray-100", textClass: "text-gray-800", dotClass: "bg-gray-500" },
};

const PROVIDER_CONFIG: Record<DeliveryProvider, { label: string; bgClass: string; textClass: string }> = {
  SHADOWFAX: { label: "Shadowfax", bgClass: "bg-orange-100", textClass: "text-orange-800" },
  SELF_DELIVERY: { label: "Self Delivery", bgClass: "bg-green-100", textClass: "text-green-800" },
  SHIPROCKET: { label: "Shiprocket", bgClass: "bg-blue-100", textClass: "text-blue-800" },
  PORTER: { label: "Porter", bgClass: "bg-purple-100", textClass: "text-purple-800" },
};

type BadgeSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

const DOT_SIZES: Record<BadgeSize, string> = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  size?: BadgeSize;
  showDot?: boolean;
  showLabel?: boolean;
}

export function DeliveryStatusBadge({
  status,
  size = "md",
  showDot = true,
  showLabel = true,
}: DeliveryStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgClass} ${config.textClass} ${SIZE_CLASSES[size]}`}>
      {showDot && <span className={`rounded-full ${config.dotClass} ${DOT_SIZES[size]}`} />}
      {showLabel && config.label}
    </span>
  );
}

interface DeliveryProviderBadgeProps {
  provider: DeliveryProvider;
  size?: BadgeSize;
}

export function DeliveryProviderBadge({ provider, size = "md" }: DeliveryProviderBadgeProps) {
  const config = PROVIDER_CONFIG[provider] || { label: provider, bgClass: "bg-gray-100", textClass: "text-gray-800" };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bgClass} ${config.textClass} ${SIZE_CLASSES[size]}`}>
      {config.label}
    </span>
  );
}