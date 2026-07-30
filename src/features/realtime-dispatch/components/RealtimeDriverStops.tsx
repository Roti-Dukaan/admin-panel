"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, MapPin, Navigation, Phone, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { realtimeDriverApi } from "@/features/realtime-dispatch/services/realtime-dispatch.api";

type Tab = "today" | "completed" | "failed";

export function RealtimeDriverStops({ tab }: { tab: Tab }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["realtime-driver", tab],
    queryFn: () => realtimeDriverApi.myDeliveries(tab),
    refetchInterval: 30000,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      failureReason,
    }: {
      id: string;
      status: "RIDER_ARRIVED" | "DELIVERED" | "FAILED";
      failureReason?: string;
    }) => {
      const mapped =
        status === "RIDER_ARRIVED"
          ? "RIDER_ARRIVED"
          : status === "DELIVERED"
            ? "DELIVERED"
            : "FAILED";
      return realtimeDriverApi.updateStatus(id, { status: mapped, failureReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realtime-driver"] });
    },
  });

  const codMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      realtimeDriverApi.collectCod(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realtime-driver"] });
      toast.success("COD recorded");
    },
  });

  const stops = data?.stops ?? [];

  if (isLoading && stops.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (stops.length === 0) return null;

  return (
    <section className="mb-6 space-y-3">
      <h2 className="text-sm font-semibold text-orange-700">Realtime orders ({stops.length})</h2>
      {stops.map((stop) => (
        <article key={stop.id} className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{stop.orderNumber}</p>
              <p className="text-sm text-gray-600">{stop.customerName}</p>
            </div>
            {stop.paymentMethod === "COD" && (
              <Badge variant="destructive" className="gap-1">
                <IndianRupee className="h-3 w-3" />
                {stop.codAmount ?? stop.grandTotal}
              </Badge>
            )}
          </div>
          <p className="mt-2 flex items-start gap-1 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {stop.address}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {stop.customerPhone && (
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${stop.customerPhone}`}>
                  <Phone className="mr-1 h-4 w-4" />
                  Call
                </a>
              </Button>
            )}
            {stop.googleMapsUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={stop.googleMapsUrl} target="_blank" rel="noreferrer">
                  <Navigation className="mr-1 h-4 w-4" />
                  Maps
                </a>
              </Button>
            )}
            {stop.dispatchStatus === "ASSIGNED" && (
              <Button
                size="sm"
                disabled={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate({ id: stop.id, status: "RIDER_ARRIVED" })
                }
              >
                Arrived
              </Button>
            )}
            {(stop.dispatchStatus === "ASSIGNED" || stop.dispatchStatus === "ARRIVED" || stop.dispatchStatus === "PICKED_UP") && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ id: stop.id, status: "DELIVERED" })}
                >
                  Delivered
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={statusMutation.isPending}
                  onClick={() => {
                    const reason = window.prompt("Failure reason?") ?? "Could not deliver";
                    statusMutation.mutate({ id: stop.id, status: "FAILED", failureReason: reason });
                  }}
                >
                  Failed
                </Button>
              </>
            )}
            {stop.paymentMethod === "COD" && stop.codCollected == null && (
              <Button
                size="sm"
                variant="secondary"
                disabled={codMutation.isPending}
                onClick={() =>
                  codMutation.mutate({
                    id: stop.id,
                    amount: stop.codAmount ?? stop.grandTotal,
                  })
                }
              >
                COD collected
              </Button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
