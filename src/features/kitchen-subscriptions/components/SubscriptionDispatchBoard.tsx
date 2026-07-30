"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionAssignmentPanel } from "@/features/delivery-boys/components/SubscriptionAssignmentPanel";
import { useSubscriptionKitchenSummary } from "../hooks/useKitchenSubscriptions";

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800">Something went wrong</p>
        <p className="text-sm text-gray-500">Could not load subscription dispatch data.</p>
      </div>
      <Button type="button" onClick={onRetry} className="bg-orange-500 hover:bg-orange-600">
        Retry
      </Button>
    </div>
  );
}

export function SubscriptionDispatchBoard() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slotId, setSlotId] = useState("all");

  const summaryQuery = useSubscriptionKitchenSummary(date);

  const slotOptions = useMemo(() => {
    const slots = summaryQuery.data?.bySlot ?? [];
    return slots.map((slot) => ({ id: slot.slotId, name: slot.slotName }));
  }, [summaryQuery.data]);

  const readyCount = summaryQuery.data?.statusCounts?.readyForDispatch ?? 0;

  if (summaryQuery.isError && !summaryQuery.data) {
    return <ErrorState onRetry={() => summaryQuery.refetch()} />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-gray-50/50 p-6">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
        <h2 className="text-sm font-bold text-indigo-900">Subscription Dispatch</h2>
        <p className="mt-1 text-sm text-indigo-800/80">
          Assign packed subscription deliveries to delivery boys or yourself. Mark items as ready in{" "}
          <Link href="/branch/kitchen?tab=subscriptions" className="font-medium underline hover:text-indigo-950">
            Kitchen → Subscription Prep
          </Link>{" "}
          before they appear here.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-auto"
            aria-label="Dispatch date"
          />
          <Select value={slotId} onValueChange={setSlotId}>
            <SelectTrigger className="h-10 w-full sm:w-56" aria-label="Filter by delivery slot">
              <SelectValue placeholder="All Slots" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Slots</SelectItem>
              {slotOptions.map((slot) => (
                <SelectItem key={slot.id} value={slot.id}>
                  {slot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {readyCount > 0 && (
          <p className="text-sm font-medium text-indigo-700">
            {readyCount} packed {readyCount === 1 ? "delivery" : "deliveries"} ready for assignment
          </p>
        )}
      </div>

      <SubscriptionAssignmentPanel date={date} slotId={slotId === "all" ? undefined : slotId} />
    </div>
  );
}
