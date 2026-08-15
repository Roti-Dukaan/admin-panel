"use client";

import { useEffect, useState } from "react";
import { Loader2, Phone, Save } from "lucide-react";
import { orderEscalationApi, type OrderEscalationSettings } from "@/lib/api/order-escalation.api";

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

export function OrderEscalationTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<OrderEscalationSettings>({
    orderEscalationEnabled: true,
    orderAcceptanceTimeoutSeconds: 60,
    orderEscalationRepeatIntervalSeconds: 30,
    orderEscalationMaxAttempts: 5,
    orderEscalationMaxDurationSeconds: 180,
    emailOnFirstEscalation: true,
    callOnFirstEscalation: true,
    callOnRepeatedEscalation: true,
  });

  useEffect(() => {
    orderEscalationApi
      .getSettings()
      .then((res) => setForm(res.data.data))
      .catch(() => setError("Failed to load escalation settings"))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof OrderEscalationSettings>(key: K, value: OrderEscalationSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await orderEscalationApi.updateSettings(form);
      setForm(res.data.data);
      setSuccess("Order escalation settings saved");
    } catch {
      setError("Failed to save escalation settings");
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Order Escalation Settings</h3>
          <p className="text-sm text-gray-500">
            Realtime orders only. Backend queue handles timing — no browser timers.
          </p>
        </div>
      </div>

      {success && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>}
      {error && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <Toggle
        checked={form.orderEscalationEnabled}
        onChange={(v) => set("orderEscalationEnabled", v)}
        label="Escalation enabled"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Timeout before first call (seconds)">
          <input
            type="number"
            min={15}
            max={600}
            value={form.orderAcceptanceTimeoutSeconds}
            onChange={(e) => set("orderAcceptanceTimeoutSeconds", Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
          />
        </Field>
        <Field label="Repeat call interval (seconds)">
          <input
            type="number"
            min={10}
            max={300}
            value={form.orderEscalationRepeatIntervalSeconds}
            onChange={(e) => set("orderEscalationRepeatIntervalSeconds", Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
          />
        </Field>
        <Field label="Maximum call attempts">
          <input
            type="number"
            min={1}
            max={20}
            value={form.orderEscalationMaxAttempts}
            onChange={(e) => set("orderEscalationMaxAttempts", Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
          />
        </Field>
        <Field label="Maximum escalation duration (seconds)">
          <input
            type="number"
            min={30}
            max={3600}
            value={form.orderEscalationMaxDurationSeconds}
            onChange={(e) => set("orderEscalationMaxDurationSeconds", Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
          />
        </Field>
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        <Toggle
          checked={form.emailOnFirstEscalation}
          onChange={(v) => set("emailOnFirstEscalation", v)}
          label="Email on first escalation (once only)"
        />
        <Toggle
          checked={form.callOnFirstEscalation}
          onChange={(v) => set("callOnFirstEscalation", v)}
          label="Voice call on first escalation"
        />
        <Toggle
          checked={form.callOnRepeatedEscalation}
          onChange={(v) => set("callOnRepeatedEscalation", v)}
          label="Repeat voice calls during escalation"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
