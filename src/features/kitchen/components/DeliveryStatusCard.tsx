"use client";

import { useState, useEffect, useCallback } from "react";
import { Bike, User, Phone, MapPin, Clock, Loader2, PackageCheck, Timer, CheckCircle2 } from "lucide-react";

export interface KitchenDeliveryInfo {
  status: string;
  provider?: string | null;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  pickupOtp?: string;
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  riderArrivedAt?: string;
  actualPickupAt?: string;
}

const STATUS_META: Record<
  string,
  { icon: React.ReactNode; title: string; tone: string }
> = {
  WAITING_FOR_PROVIDER: { icon: <Loader2 className="h-5 w-5" />, title: "Searching Delivery Partner", tone: "text-blue-700 bg-blue-50" },
  PROVIDER_ASSIGNMENT_FAILED: { icon: <Bike className="h-5 w-5" />, title: "Assignment Failed", tone: "text-rose-700 bg-rose-50" },
  PROVIDER_ASSIGNED: { icon: <Bike className="h-5 w-5" />, title: "Delivery Partner Assigned", tone: "text-emerald-700 bg-emerald-50" },
  RIDER_ARRIVING: { icon: <MapPin className="h-5 w-5" />, title: "Rider Arriving At Kitchen", tone: "text-amber-700 bg-amber-50" },
  RIDER_ARRIVED: { icon: <CheckCircle2 className="h-5 w-5" />, title: "Partner Arrived", tone: "text-emerald-700 bg-emerald-50" },
  AWAITING_PICKUP: { icon: <Timer className="h-5 w-5" />, title: "Awaiting Pickup", tone: "text-orange-700 bg-orange-50" },
  PICKED_UP: { icon: <PackageCheck className="h-5 w-5" />, title: "Picked Up", tone: "text-emerald-700 bg-emerald-50" },
};

/** Live ticking countdown to a target time. Returns MM:SS or null. */
function useCountdown(targetIso: string | undefined): { text: string; secondsLeft: number } | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!targetIso) return null;

  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, Math.floor((target - now) / 1000));

  if (diff <= 0) return null;

  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return { text: `${mins}:${String(secs).padStart(2, "0")}`, secondsLeft: diff };
}

/** Live count-up from a start time. Returns "Xm Ys". */
function useElapsed(startIso: string | undefined): string | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startIso]);

  if (!startIso) return null;

  const elapsed = Math.max(0, Math.floor((now - new Date(startIso).getTime()) / 1000));
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/**
 * Delivery Status Card rendered on a Ready kitchen ticket. Surfaces the live
 * delivery lifecycle (rider assignment, arrival, pickup) without requiring the
 * kitchen to manually update anything.
 *
 * For QUICK orders:
 * - Before arrival: live countdown to estimatedPickupAt
 * - After arrival: "Partner Arrived" badge + elapsed waiting time
 */
export function DeliveryStatusCard({ delivery }: { delivery: KitchenDeliveryInfo }) {
  const meta = STATUS_META[delivery.status] ?? STATUS_META.WAITING_FOR_PROVIDER;
  const isArrived = delivery.status === "RIDER_ARRIVED" || delivery.status === "AWAITING_PICKUP";
  const isPreArrival = ["WAITING_FOR_PROVIDER", "PROVIDER_ASSIGNED", "RIDER_ARRIVING"].includes(delivery.status);

  const countdown = useCountdown(isPreArrival ? delivery.estimatedPickupAt : undefined);
  const elapsed = useElapsed(isArrived ? (delivery.riderArrivedAt ?? delivery.estimatedPickupAt) : undefined);

  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-3">
      <div className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${meta.tone}`}>
        <span className={isPreArrival && delivery.status !== "WAITING_FOR_PROVIDER" ? "" : "animate-pulse"}>
          {meta.icon}
        </span>
        <span className="text-sm font-semibold">{meta.title}</span>
      </div>

      {/* Live countdown to rider arrival */}
      {isPreArrival && countdown && (
        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-center">
          <p className="text-[11px] uppercase tracking-wide text-amber-600">Arriving in</p>
          <p className="font-mono text-2xl font-bold tabular-nums text-amber-800">{countdown.text}</p>
        </div>
      )}

      {/* Partner Arrived — waiting for pickup */}
      {isArrived && (
        <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm font-semibold">Partner Arrived</p>
          </div>
          {elapsed && (
            <p className="mt-1 text-xs text-emerald-600">Waiting for pickup · {elapsed}</p>
          )}
        </div>
      )}

      {/* Rider info */}
      {delivery.riderName && (
        <div className="mt-2.5 rounded-lg bg-white p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{delivery.riderName}</p>
              <p className="text-xs text-gray-500">Bike · {delivery.vehicleNumber ?? "—"}</p>
            </div>
          </div>

          {delivery.riderPhone && (
            <a
              href={`tel:${delivery.riderPhone}`}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {delivery.riderPhone}
            </a>
          )}
        </div>
      )}

      {/* Pickup OTP */}
      {delivery.pickupOtp && ["PROVIDER_ASSIGNED", "RIDER_ARRIVING", "RIDER_ARRIVED", "AWAITING_PICKUP"].includes(delivery.status) && (
        <div className="mt-2.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50 px-3 py-2 text-center">
          <p className="text-[11px] uppercase tracking-wide text-indigo-500">Pickup OTP</p>
          <p className="font-mono text-xl font-bold tracking-[0.3em] text-indigo-700">{delivery.pickupOtp}</p>
        </div>
      )}

      {/* Picked up confirmation */}
      {delivery.status === "PICKED_UP" && delivery.actualPickupAt && (
        <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <PackageCheck className="h-3.5 w-3.5" />
          Picked up at {new Date(delivery.actualPickupAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

/** Shown when the rider is waiting at the kitchen to collect the order. */
export function AwaitingPickupCard({ since, otp }: { since?: string; otp?: string }) {
  const elapsed = useElapsed(since);
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-center gap-2 text-amber-800">
        <Timer className="h-4 w-4" />
        <span className="text-sm font-semibold">Rider Waiting For Pickup</span>
      </div>
      {elapsed && (
        <p className="mt-1 text-xs text-amber-700">Waiting · {elapsed}</p>
      )}
      {otp && (
        <p className="mt-1.5 text-center font-mono text-lg font-bold tracking-[0.25em] text-amber-800">{otp}</p>
      )}
    </div>
  );
}

/** Compact rider card used inside the kitchen ticket detail drawer. */
export function DeliveryPartnerCard({
  name,
  phone,
  vehicleNumber,
  otp,
}: {
  name?: string;
  phone?: string;
  vehicleNumber?: string;
  otp?: string;
}) {
  if (!name) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Bike className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">Bike · {vehicleNumber ?? "—"}</p>
        </div>
      </div>
      {phone && (
        <a href={`tel:${phone}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline">
          <Phone className="h-3.5 w-3.5" />
          {phone}
        </a>
      )}
      {otp && (
        <div className="mt-2 rounded-lg bg-indigo-50 px-2 py-1.5 text-center">
          <p className="font-mono text-lg font-bold tracking-[0.25em] text-indigo-700">{otp}</p>
          <p className="text-[11px] text-indigo-500">Pickup OTP</p>
        </div>
      )}
    </div>
  );
}
