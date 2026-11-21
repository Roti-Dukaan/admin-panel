"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  realtimeOrderHoursApi,
  type RealtimeOrderHoursSettings,
} from "@/lib/api/realtime-order-hours.api";
import { DeliverySlotTimeInput } from "@/components/delivery/DeliverySlotTimeInput";
import { formatDeliverySlotTime } from "@/lib/delivery-slot-display";

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{ backgroundColor: checked ? "#f97316" : "#e5e7eb" }}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
      >
        <span
          style={{ transform: checked ? "translateX(24px)" : "translateX(4px)" }}
          className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        />
      </button>
    </label>
  );
}

export function RealtimeOrderHoursTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<RealtimeOrderHoursSettings>({
    realtimeOrderScheduleEnabled: true,
    realtimeOrderOpenTime: "08:00",
    realtimeOrderCloseTime: "22:00",
    currentlyAcceptingOrders: true,
  });

  useEffect(() => {
    realtimeOrderHoursApi
      .getSettings()
      .then((res) => setForm(res.data.data))
      .catch(() => setError("Failed to load realtime order hours"))
      .finally(() => setLoading(false));
  }, []);

  const persistSettings = async (next: RealtimeOrderHoursSettings) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await realtimeOrderHoursApi.updateSettings({
        realtimeOrderScheduleEnabled: next.realtimeOrderScheduleEnabled,
        realtimeOrderOpenTime: next.realtimeOrderOpenTime,
        realtimeOrderCloseTime: next.realtimeOrderCloseTime,
      });
      const saved = res.data.data;
      setForm(saved);
      if (!next.realtimeOrderScheduleEnabled) {
        const reopened = (saved as { kitchensReopenedFromGlobalSchedule?: number })
          .kitchensReopenedFromGlobalSchedule;
        const msg =
          typeof reopened === "number" && reopened > 0
            ? `Global order hours disabled. Reopened ${reopened} kitchen(s) that were closed by the schedule.`
            : "Global order hours disabled. Branches control kitchen open/close on their own.";
        setSuccess(msg);
        toast.success(msg);
      } else {
        const msg = "Global order hours saved. All kitchens follow this IST schedule.";
        setSuccess(msg);
        toast.success(msg);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      const text = message || "Failed to save order hours";
      setError(text);
      toast.error(text);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => void persistSettings(form);

  const handleToggleEnabled = (enabled: boolean) => {
    const next = { ...form, realtimeOrderScheduleEnabled: enabled };
    setForm(next);
    void persistSettings(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Global realtime order hours</h3>
          <p className="text-sm text-gray-500">
            All kitchens open and close for realtime orders at the same time (Asia/Kolkata). Backend runs every
            minute — no browser timers.
          </p>
        </div>
      </div>

      {success && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>}
      {error && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <Toggle
        checked={form.realtimeOrderScheduleEnabled}
        onChange={handleToggleEnabled}
        label="Enable global order schedule"
        disabled={saving}
      />
      <p className="text-xs text-gray-500 -mt-2">
        Changes save immediately when you flip this switch. Use &quot;Save schedule&quot; below only for open/close
        times.
      </p>

      <div
        className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${!form.realtimeOrderScheduleEnabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Opens at (IST)</label>
          <DeliverySlotTimeInput
            value={form.realtimeOrderOpenTime}
            onChange={(realtimeOrderOpenTime) => setForm((p) => ({ ...p, realtimeOrderOpenTime }))}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Closes at (IST)</label>
          <DeliverySlotTimeInput
            value={form.realtimeOrderCloseTime}
            onChange={(realtimeOrderCloseTime) => setForm((p) => ({ ...p, realtimeOrderCloseTime }))}
          />
        </div>
      </div>

      <p className="text-sm text-gray-600 rounded-lg bg-gray-50 px-3 py-2">
        {!form.realtimeOrderScheduleEnabled ? (
          <strong>Global hours off</strong>
        ) : (
          <>
            Right now:{" "}
            <strong>{form.currentlyAcceptingOrders ? "Accepting realtime orders" : "Outside order hours"}</strong>
            {" "}
            (daily {formatDeliverySlotTime(form.realtimeOrderOpenTime)} –{" "}
            {formatDeliverySlotTime(form.realtimeOrderCloseTime)} IST)
          </>
        )}
      </p>

      <p className="text-xs text-gray-500">
        Branch managers can still temporarily close a kitchen with a reason. If their reopen time falls outside
        these hours, it is moved to the next global open time and they are notified in the close dialog.
      </p>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save schedule
      </button>
    </div>
  );
}
