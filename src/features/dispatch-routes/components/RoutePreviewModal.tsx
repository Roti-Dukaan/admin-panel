"use client";

import * as React from "react";
import { Loader2, MapPin, Navigation, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssigneeSelect } from "@/features/delivery-boys/components/AssigneeSelect";
import type { AssignableStaff } from "@/features/delivery-boys/types/delivery-boys";
import { useGoogleMapsScript } from "@/features/kitchen-location/hooks/useGoogleMapsScript";
import type { RouteOptimizationResult } from "../services/dispatch-routes.api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optimization: RouteOptimizationResult | null;
  staff: AssignableStaff[];
  busy?: boolean;
  onAssignDriver: (driverId: string) => void;
  onAssignBorzo: () => void;
  onCancel: () => void;
};

function RouteMap({
  optimization,
}: {
  optimization: RouteOptimizationResult;
}) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const { isLoaded, error } = useGoogleMapsScript();

  React.useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: {
        lat: optimization.origin.latitude,
        lng: optimization.origin.longitude,
      },
    });

    new window.google.maps.Marker({
      map,
      position: { lat: optimization.origin.latitude, lng: optimization.origin.longitude },
      label: "K",
      title: optimization.origin.label,
    });

    const path = optimization.stops.map((s) => ({ lat: s.latitude, lng: s.longitude }));
    if (path.length > 0) {
      new window.google.maps.Polyline({
        map,
        path,
        geodesic: true,
        strokeColor: "#f97316",
        strokeOpacity: 0.9,
        strokeWeight: 3,
      });

      optimization.stops.forEach((stop) => {
        new window.google.maps.Marker({
          map,
          position: { lat: stop.latitude, lng: stop.longitude },
          label: String(stop.sequence),
          title: stop.customerName,
        });
      });

      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: optimization.origin.latitude, lng: optimization.origin.longitude });
      path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 48);
    }
  }, [isLoaded, optimization]);

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
        Map unavailable: {error}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return <div ref={mapRef} className="h-48 w-full rounded-xl border border-gray-200" />;
}

export function RoutePreviewModal({
  open,
  onOpenChange,
  optimization,
  staff,
  busy,
  onAssignDriver,
  onAssignBorzo,
  onCancel,
}: Props) {
  const [driverId, setDriverId] = React.useState("");

  if (!optimization) return null;

  const distanceKm = (optimization.totalDistanceMeters / 1000).toFixed(1);
  const durationMin = Math.round(optimization.totalDurationSeconds / 60);
  const hasLive = optimization.stops.some((s) => s.type === "LIVE");
  const hasSubscription = optimization.stops.some((s) => s.type === "SUBSCRIPTION");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-orange-500" />
            Optimized Route Preview
          </DialogTitle>
          <DialogDescription>
            {optimization.stops.length} stops · {distanceKm} km · ~{durationMin} min · via{" "}
            {optimization.optimizedVia === "google_routes" ? "Google Routes" : "nearest neighbour"}
          </DialogDescription>
        </DialogHeader>

        <RouteMap optimization={optimization} />

        <ol className="space-y-2">
          {optimization.stops.map((stop) => (
            <li
              key={`${stop.type}-${stop.id}`}
              className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                {stop.sequence}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">
                  {stop.customerName}
                  <span className="ml-2 text-xs text-gray-400">{stop.orderNumber}</span>
                </p>
                <p className="mt-0.5 flex items-start gap-1 text-xs text-gray-600">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {stop.addressText}
                </p>
                {stop.distanceFromPreviousMeters != null && (
                  <p className="mt-1 text-xs text-gray-400">
                    {Math.round(stop.distanceFromPreviousMeters / 1000 * 10) / 10} km from previous
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {stop.type}
              </span>
            </li>
          ))}
        </ol>

        <DialogFooter className="flex flex-col gap-3 sm:flex-col sm:items-stretch">
          <div className="flex flex-wrap items-center gap-2">
            <AssigneeSelect
              value={driverId}
              onChange={setDriverId}
              staff={staff}
              disabled={busy}
              placeholder="Select driver"
            />
            <Button
              type="button"
              disabled={busy || !driverId}
              onClick={() => onAssignDriver(driverId)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Navigation className="mr-1 h-4 w-4" />
              Assign Driver
            </Button>
            {hasLive && (
              <Button type="button" variant="outline" disabled={busy} onClick={onAssignBorzo}>
                Assign Borzo
              </Button>
            )}
            {hasSubscription && !hasLive && (
              <span className="text-xs text-gray-500">Borzo applies to live orders only</span>
            )}
            <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
