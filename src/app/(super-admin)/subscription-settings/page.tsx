"use client";

import { useCallback, useEffect, useState } from "react";
import { Info, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { packagesApi } from "@/features/subscription-packages/services/packages.api";
import type { SubscriptionPackage } from "@/features/subscription-packages/types/subscription-package";
import { formatDeliverySlotTime } from "@/lib/delivery-slot-display";

interface RuleForm {
  selectionCutoffHours: number;
  skipEnabled: boolean;
  skipCutoffHours: number;
  monthlySkipLimit: number;
  weeklySkipLimit: number;
  maxSkipDaysPerCycle: number;
  allowCustomerCategorySelection: boolean;
}

function toForm(pkg: SubscriptionPackage): RuleForm {
  return {
    selectionCutoffHours: pkg.selectionCutoffHours ?? 24,
    skipEnabled: pkg.skipEnabled ?? true,
    skipCutoffHours: pkg.skipCutoffHours ?? 12,
    monthlySkipLimit: pkg.monthlySkipLimit ?? 2,
    weeklySkipLimit: pkg.weeklySkipLimit ?? 1,
    maxSkipDaysPerCycle: pkg.maxSkipDaysPerCycle ?? 2,
    allowCustomerCategorySelection: pkg.allowCustomerCategorySelection ?? false,
  };
}

/**
 * The backend anchors the deadline to midnight of the delivery day, so 24 hours
 * lands on the previous day at 00:00 and 12 hours on the previous day at 12:00.
 */
function describeCutoff(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "—";
  const days = Math.floor(hours / 24);
  const remainder = hours % 24;
  const clock = `${String((24 - remainder) % 24).padStart(2, "0")}:00`;
  const displayClock = formatDeliverySlotTime(clock);
  if (remainder === 0) {
    return days === 1
      ? `Previous day, ${displayClock}`
      : `${days} days before, ${displayClock}`;
  }
  return days === 0
    ? `Previous day, ${displayClock}`
    : `${days + 1} days before, ${displayClock}`;
}

function NumberField({
  label,
  value,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      <Input
        type="number"
        min={0}
        value={String(value)}
        disabled={disabled}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-[11px] text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PlanRuleCard({
  pkg,
  onSaved,
}: {
  pkg: SubscriptionPackage;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<RuleForm>(() => toForm(pkg));
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(toForm(pkg)), [pkg]);

  const patch = <K extends keyof RuleForm>(key: K, value: RuleForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await packagesApi.update(pkg.id, {
        selectionCutoffHours: Math.max(1, form.selectionCutoffHours),
        skipEnabled: form.skipEnabled,
        skipCutoffHours: form.skipCutoffHours,
        monthlySkipLimit: form.monthlySkipLimit,
        weeklySkipLimit: form.weeklySkipLimit,
        maxSkipDaysPerCycle: form.maxSkipDaysPerCycle,
        allowCustomerCategorySelection: form.allowCustomerCategorySelection,
      });
      toast.success(`${pkg.name} rules updated`);
      onSaved();
    } catch {
      toast.error(`Could not update ${pkg.name}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="text-base">{pkg.name}</CardTitle>
          <p className="mt-0.5 text-xs text-gray-500">
            {pkg.billingCycle === "WEEKLY" ? "Weekly" : "Monthly"} · {pkg.validityDays} days ·{" "}
            {pkg.deliveriesPerCycle} deliveries
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            pkg.active ?? pkg.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {pkg.active ?? pkg.isActive ? "Active" : "Inactive"}
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField
            label="Customization cut-off (hrs)"
            value={form.selectionCutoffHours}
            onChange={(v) => patch("selectionCutoffHours", v)}
            hint={describeCutoff(form.selectionCutoffHours)}
          />
          <NumberField
            label="Skip cut-off (hrs)"
            value={form.skipCutoffHours}
            onChange={(v) => patch("skipCutoffHours", v)}
            hint="Hours before delivery when skipping closes"
            disabled={!form.skipEnabled}
          />
          <NumberField
            label="Max skips per cycle"
            value={form.maxSkipDaysPerCycle}
            onChange={(v) => patch("maxSkipDaysPerCycle", v)}
            disabled={!form.skipEnabled}
          />
          <NumberField
            label="Monthly skip limit"
            value={form.monthlySkipLimit}
            onChange={(v) => patch("monthlySkipLimit", v)}
            disabled={!form.skipEnabled}
          />
          <NumberField
            label="Weekly skip limit"
            value={form.weeklySkipLimit}
            onChange={(v) => patch("weeklySkipLimit", v)}
            disabled={!form.skipEnabled}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleRow
            label="Allow skipping"
            description="Customers can skip a delivery before the cut-off"
            checked={form.skipEnabled}
            onChange={(v) => patch("skipEnabled", v)}
          />
          <ToggleRow
            label="Customer category selection"
            description="Customers pick their own categories at checkout"
            checked={form.allowCustomerCategorySelection}
            onChange={(v) => patch("allowCustomerCategorySelection", v)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save rules"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionSettingsPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPackages(await packagesApi.list());
    } catch {
      toast.error("Could not load subscription plans");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscription Settings"
        subtitle="Cut-off windows and skip rules for every plan"
        actions={
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="space-y-4 p-6">
        <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <p className="text-xs leading-relaxed text-sky-900">
            Cut-offs are enforced by the backend, never by the app. Changing the customization
            cut-off also re-syncs deadlines on every future delivery that is not locked yet.
          </p>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-gray-400">Loading plans…</p>
        ) : packages.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-sm text-gray-500">
            No subscription plans yet. Create one under Subscriptions → Plans.
          </div>
        ) : (
          packages.map((pkg) => <PlanRuleCard key={pkg.id} pkg={pkg} onSaved={load} />)
        )}
      </div>
    </div>
  );
}
