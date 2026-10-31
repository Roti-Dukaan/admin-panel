"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import {
  realtimeOrderHoursApi,
  type RealtimeOrderHoursSettings,
} from "@/lib/api/realtime-order-hours.api";
import { DeliverySlotTimeInput } from "@/components/delivery/DeliverySlotTimeInput";
import { formatDeliverySlotTime } from "@/lib/delivery-slot-display";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      <button
        type="button"
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

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await realtimeOrderHoursApi.updateSettings({
        realtimeOrderScheduleEnabled: form.realtimeOrderScheduleEnabled,
        realtimeOrderOpenTime: form.realtimeOrderOpenTime,
        realtimeOrderCloseTime: form.realtimeOrderCloseTime,
      });
      setForm(res.data.data);
      setSuccess("Global order hours saved. All kitchens follow this IST schedule.");
    } catch {
      setError("Failed to save order hours");
    } finally {
      setSaving(false);
    }
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
        onChange={(v) => setForm((p) => ({ ...p, realtimeOrderScheduleEnabled: v }))}
        label="Enable global order schedule"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        Right now:{" "}
        <strong>{form.currentlyAcceptingOrders ? "Accepting realtime orders" : "Outside order hours"}</strong>
        {form.realtimeOrderScheduleEnabled && (
          <>
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
