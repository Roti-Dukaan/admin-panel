"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2, Link2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { SubscriptionMenuTable } from "@/features/subscription-menu/components/SubscriptionMenuTable";
import { SubscriptionMenuDrawer } from "@/features/subscription-menu/components/SubscriptionMenuDrawer";
import { useSubscriptionMenuStore } from "@/features/subscription-menu/hooks/useSubscriptionMenu";
import { useSubscriptionPlanStore } from "@/features/subscription-plans/hooks/useSubscriptionPlans";
import { subscriptionMenuApi } from "@/features/subscription-menu/services/subscription-menu.api";
import { toast } from "sonner";
import { ROTI_TYPE_LABELS } from "@/features/subscription-menu/types/subscription-menu";

export default function SubscriptionMenuPage() {
  const loadItems = useSubscriptionMenuStore((s) => s.loadItems);
  const openAddDrawer = useSubscriptionMenuStore((s) => s.openAddDrawer);
  const items = useSubscriptionMenuStore((s) => s.items);
  const loading = useSubscriptionMenuStore((s) => s.loading);
  const plans = useSubscriptionPlanStore((s) => s.plans);
  const loadPlans = useSubscriptionPlanStore((s) => s.loadPlans);

  const [planId, setPlanId] = useState("");
  const [planLinks, setPlanLinks] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    void loadItems();
    void loadPlans();
  }, [loadItems, loadPlans]);

  useEffect(() => {
    if (!planId) {
      setPlanLinks([]);
      return;
    }
    subscriptionMenuApi.listPlanItems(planId).then((links) => {
      setPlanLinks(links.map((l) => l.subscriptionMenuItemId));
    });
  }, [planId, items]);

  const activeCount = useMemo(
    () => items.filter((i) => i.active && i.subscriptionEnabled).length,
    [items],
  );

  const togglePlanAssignment = async (menuItemId: string) => {
    if (!planId) return;
    setAssigning(true);
    try {
      if (planLinks.includes(menuItemId)) {
        await subscriptionMenuApi.detachFromPlan(planId, menuItemId);
        setPlanLinks((prev) => prev.filter((id) => id !== menuItemId));
      } else {
        await subscriptionMenuApi.attachToPlan(planId, [menuItemId]);
        setPlanLinks((prev) => [...prev, menuItemId]);
      }
      toast.success("Plan assignment updated");
    } catch {
      toast.error("Failed to update plan assignment");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscription Menu"
        subtitle="Manage roti catalogue for subscription plans — separate from one-time order menu."
        actions={
          <button
            onClick={openAddDrawer}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Roti
          </button>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total Items" value={items.length} />
          <Stat label="Active" value={activeCount} />
          <Stat label="Roti Types" value={new Set(items.map((i) => i.rotiType)).size} />
          <Stat label="Plans" value={plans.length} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <SubscriptionMenuTable items={items} />
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Assign Items to Plan
            </h2>
          </div>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="mb-4 h-11 w-full max-w-md rounded-xl border border-gray-200 px-4 text-sm"
          >
            <option value="">Select a subscription plan…</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {planId && (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const assigned = planLinks.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={assigning}
                    onClick={() => void togglePlanAssignment(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      assigned
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                    }`}
                  >
                    {ROTI_TYPE_LABELS[item.rotiType]} — {item.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <SubscriptionMenuDrawer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
