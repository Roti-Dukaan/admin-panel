"use client";

import { format } from "date-fns";
import { useTodaySubscriptionLoad } from "@/features/kitchen-subscriptions/hooks/useKitchenSubscriptions";

export function SubscriptionLoadCard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data } = useTodaySubscriptionLoad(today);

  if (!data || data.totalDeliveries === 0) return null;

  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
            Today&apos;s Subscription Load
          </p>
          <p className="mt-1 text-sm text-orange-900">
            {data.totalDeliveries} subscription deliveries · {data.totalPacks} packs · {data.totalRotis} rotis
          </p>
        </div>
        <p className="text-xs text-orange-700">
          Combined with live orders above — open the Subscription Prep tab for details.
        </p>
      </div>
    </div>
  );
}
