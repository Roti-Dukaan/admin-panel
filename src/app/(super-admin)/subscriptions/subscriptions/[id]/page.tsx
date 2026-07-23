"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { SubscriptionDrawer } from "@/features/subscriptions/components/SubscriptionDrawer";
import { subscriptionsApi } from "@/features/subscriptions/services/subscriptions.api";
import {
  useSubscriptionsStore,
} from "@/features/subscriptions/hooks/useSubscriptions";

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const setSelected = useSubscriptionsStore((s) => s.setSelectedSubscription);
  const setDrawerOpen = useSubscriptionsStore((s) => s.setDrawerOpen);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    subscriptionsApi
      .getById(id)
      .then((sub) => {
        if (!active) return;
        setSelected(sub);
        setDrawerOpen(true);
      })
      .catch(() => {
        if (active) router.replace("/subscriptions");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, setSelected, setDrawerOpen, router]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscription Detail"
        subtitle="Viewing a customer subscription."
        actions={
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Subscriptions
          </Link>
        }
      />
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        {loading && (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading subscription…
          </span>
        )}
      </div>
      <SubscriptionDrawer />
    </div>
  );
}
