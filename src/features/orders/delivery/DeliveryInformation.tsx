"use client";

import { useState } from "react";
import {
  Truck,
  User,
  Phone,
  Bike,
  MapPin,
  Clock,
  PackageCheck,
  Copy,
  ExternalLink,
  History,
  Hash,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeliveryStatusBadge } from "@/features/delivery/components/DeliveryStatusBadge";
import {
  DELIVERY_PROVIDER_LABELS,
  type DeliveryTracking,
} from "@/features/delivery/types/delivery";

interface DeliveryInformationProps {
  delivery: DeliveryTracking;
  onViewTimeline?: () => void;
}

export function DeliveryInformation({ delivery, onViewTimeline }: DeliveryInformationProps) {
  const [copied, setCopied] = useState(false);

  const copyTracking = async () => {
    if (!delivery.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(delivery.trackingNumber);
      setCopied(true);
      toast.success("Tracking number copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Delivery Information</h3>
            <p className="text-xs text-gray-500">
              {delivery.provider ? DELIVERY_PROVIDER_LABELS[delivery.provider as keyof typeof DELIVERY_PROVIDER_LABELS] ?? delivery.provider : "Unassigned"}
            </p>
          </div>
        </div>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Field icon={<Hash className="h-3.5 w-3.5" />} label="Tracking Number">
          <span className="font-mono text-gray-900">{delivery.trackingNumber ?? "N/A"}</span>
        </Field>
        <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Current Status">
          <span className="text-gray-900">{delivery.providerStatus ?? delivery.status.replace(/_/g, " ")}</span>
        </Field>

        {delivery.pickupOtp && (
          <Field icon={<PackageCheck className="h-3.5 w-3.5" />} label="Pickup OTP">
            <span className="font-mono text-base font-bold tracking-widest text-indigo-700">{delivery.pickupOtp}</span>
          </Field>
        )}

        {delivery.riderName && (
          <Field icon={<User className="h-3.5 w-3.5" />} label="Delivery Partner">
            <span className="text-gray-900">{delivery.riderName}</span>
          </Field>
        )}
        {delivery.riderPhone && (
          <Field icon={<Phone className="h-3.5 w-3.5" />} label="Phone">
            <a href={`tel:${delivery.riderPhone}`} className="text-indigo-600 hover:underline">
              {delivery.riderPhone}
            </a>
          </Field>
        )}
        {delivery.vehicleNumber && (
          <Field icon={<Bike className="h-3.5 w-3.5" />} label="Vehicle Number">
            <span className="font-mono text-gray-900">{delivery.vehicleNumber}</span>
          </Field>
        )}

        {delivery.estimatedPickupAt && (
          <Field icon={<Clock className="h-3.5 w-3.5" />} label="Est. Pickup">
            <span className="text-gray-900">{fmt(delivery.estimatedPickupAt)}</span>
          </Field>
        )}
        {delivery.estimatedDeliveryAt && (
          <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Est. Delivery">
            <span className="text-gray-900">{fmt(delivery.estimatedDeliveryAt)}</span>
          </Field>
        )}
        {delivery.actualPickupAt && (
          <Field icon={<Clock className="h-3.5 w-3.5" />} label="Actual Pickup">
            <span className="text-gray-900">{fmt(delivery.actualPickupAt)}</span>
          </Field>
        )}
        {delivery.actualDeliveryAt && (
          <Field icon={<PackageCheck className="h-3.5 w-3.5" />} label="Actual Delivery">
            <span className="text-gray-900">{fmt(delivery.actualDeliveryAt)}</span>
          </Field>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onViewTimeline}>
          <History className="h-4 w-4" />
          View Timeline
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={copyTracking} disabled={!delivery.trackingNumber}>
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy Tracking #"}
        </Button>
        {delivery.trackingUrl && (
          <a href={delivery.trackingUrl} target="_blank" rel="noopener noreferrer" className="contents">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-4 w-4" />
              Open Tracking URL
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-gray-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

function fmt(value: string): string {
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
