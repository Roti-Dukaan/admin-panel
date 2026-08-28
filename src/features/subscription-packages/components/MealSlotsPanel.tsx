"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Plus, Pencil, Trash2, Clock, UtensilsCrossed } from "lucide-react";
import { DeliverySlotTimeInput } from "@/components/delivery/DeliverySlotTimeInput";
import { deliverySlotsApi, type DeliverySlot } from "@/lib/api/delivery-slots.api";
import {
  formatDeliverySlotLabel,
  formatDeliverySlotWindow,
} from "@/lib/delivery-slot-display";
import { mealSlotsApi } from "../services/meal-slots.api";
import {
  CUTOFF_MODE_OPTIONS,
  MEAL_TYPE_OPTIONS,
  defaultCutoffRule,
  formatCutoffRule,
  type CutoffMode,
  type CutoffRule,
  type PlanMealBundle,
  type PlanMealSlot,
  type UpsertBundleInput,
  type UpsertMealSlotInput,
} from "../types/meal-slot";

type MealSlotsPanelProps = {
  planId: string;
  readOnly?: boolean;
};

type MealSlotForm = {
  id?: string;
  mealType: UpsertMealSlotInput["mealType"];
  name: string;
  basePrice: number;
  deliverySlotId: string;
  mealScheduleKey: string;
  customizationEnabled: boolean;
  skipEnabled: boolean;
  customizationMode: CutoffMode;
  customizationTime: string;
  customizationHours: number;
  skipMode: CutoffMode;
  skipTime: string;
  skipHours: number;
  sortOrder: number;
};

type BundleForm = {
  id?: string;
  name: string;
  price: number;
  savingsLabel: string;
  mealSlotIds: string[];
  sortOrder: number;
};

function ruleFromForm(mode: CutoffMode, time: string, hours: number): CutoffRule {
  if (mode === "hours_before") return { mode, hours };
  return { mode, time };
}

function formFromSlot(slot: PlanMealSlot): MealSlotForm {
  const custom = slot.customizationCutoffRule ?? defaultCutoffRule();
  const skip = slot.skipCutoffRule ?? custom;
  return {
    id: slot.id,
    mealType: slot.mealType,
    name: slot.name,
    basePrice: slot.basePrice,
    deliverySlotId: slot.deliverySlotId,
    mealScheduleKey: slot.mealScheduleKey ?? "",
    customizationEnabled: slot.customizationEnabled,
    skipEnabled: slot.skipEnabled,
    customizationMode: custom.mode,
    customizationTime: custom.time ?? "22:00",
    customizationHours: custom.hours ?? 24,
    skipMode: skip.mode,
    skipTime: skip.time ?? "22:00",
    skipHours: skip.hours ?? 24,
    sortOrder: slot.sortOrder,
  };
}

function emptyMealSlotForm(deliverySlots: DeliverySlot[]): MealSlotForm {
  return {
    mealType: "LUNCH",
    name: "Lunch",
    basePrice: 0,
    deliverySlotId: deliverySlots[0]?.id ?? "",
    mealScheduleKey: "lunch",
    customizationEnabled: true,
    skipEnabled: true,
    customizationMode: "previous_day",
    customizationTime: "22:00",
    customizationHours: 24,
    skipMode: "previous_day",
    skipTime: "22:00",
    skipHours: 24,
    sortOrder: 0,
  };
}

function mealSlotFormToPayload(form: MealSlotForm): UpsertMealSlotInput {
  return {
    id: form.id,
    mealType: form.mealType,
    name: form.name.trim(),
    basePrice: Number(form.basePrice) || 0,
    deliverySlotId: form.deliverySlotId,
    mealScheduleKey: form.mealScheduleKey.trim() || undefined,
    customizationEnabled: form.customizationEnabled,
    skipEnabled: form.skipEnabled,
    customizationCutoffRule: ruleFromForm(
      form.customizationMode,
      form.customizationTime,
      form.customizationHours,
    ),
    skipCutoffRule: ruleFromForm(form.skipMode, form.skipTime, form.skipHours),
    sortOrder: form.sortOrder,
    status: "ACTIVE",
  };
}

function CutoffFields({
  label,
  mode,
  time,
  hours,
  disabled,
  onModeChange,
  onTimeChange,
  onHoursChange,
}: {
  label: string;
  mode: CutoffMode;
  time: string;
  hours: number;
  disabled?: boolean;
  onModeChange: (mode: CutoffMode) => void;
  onTimeChange: (time: string) => void;
  onHoursChange: (hours: number) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <select
        disabled={disabled}
        value={mode}
        onChange={(e) => onModeChange(e.target.value as CutoffMode)}
        className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
      >
        {CUTOFF_MODE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {mode === "hours_before" ? (
        <input
          disabled={disabled}
          type="number"
          min={1}
          value={hours}
          onChange={(e) => onHoursChange(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      ) : (
        <DeliverySlotTimeInput
          disabled={disabled}
          value={time}
          onChange={onTimeChange}
        />
      )}
    </div>
  );
}

export function MealSlotsPanel({ planId, readOnly = false }: MealSlotsPanelProps) {
  const [mealSlots, setMealSlots] = useState<PlanMealSlot[]>([]);
  const [bundles, setBundles] = useState<PlanMealBundle[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [slotEditorOpen, setSlotEditorOpen] = useState(false);
  const [slotForm, setSlotForm] = useState<MealSlotForm | null>(null);

  const [bundleEditorOpen, setBundleEditorOpen] = useState(false);
  const [bundleForm, setBundleForm] = useState<BundleForm | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalogue, slots] = await Promise.all([
        mealSlotsApi.catalogue(planId),
        deliverySlotsApi.list(),
      ]);
      setMealSlots(catalogue.mealSlots);
      setBundles(catalogue.bundles);
      setDeliverySlots(slots.filter((s) => s.isActive));
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to load meal slots";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  const slotLabelMap = useMemo(
    () => new Map(mealSlots.map((s) => [s.id, s.name])),
    [mealSlots],
  );

  const openCreateSlot = () => {
    setSlotForm(emptyMealSlotForm(deliverySlots));
    setSlotEditorOpen(true);
  };

  const openEditSlot = (slot: PlanMealSlot) => {
    setSlotForm(formFromSlot(slot));
    setSlotEditorOpen(true);
  };

  const saveSlot = async () => {
    if (!slotForm || readOnly) return;
    if (!slotForm.name.trim() || !slotForm.deliverySlotId) {
      setError("Meal slot name and delivery slot are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await mealSlotsApi.upsertMealSlot(planId, mealSlotFormToPayload(slotForm));
      setSlotEditorOpen(false);
      setSlotForm(null);
      await load();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to save meal slot";
      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

  const removeSlot = async (mealSlotId: string) => {
    if (readOnly) return;
    if (!window.confirm("Deactivate this meal slot?")) return;
    setSaving(true);
    try {
      await mealSlotsApi.removeMealSlot(planId, mealSlotId);
      await load();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to remove meal slot";
      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

  const openCreateBundle = () => {
    setBundleForm({
      name: "",
      price: 0,
      savingsLabel: "",
      mealSlotIds: mealSlots.slice(0, 2).map((s) => s.id),
      sortOrder: 0,
    });
    setBundleEditorOpen(true);
  };

  const openEditBundle = (bundle: PlanMealBundle) => {
    setBundleForm({
      id: bundle.id,
      name: bundle.name,
      price: bundle.price,
      savingsLabel: bundle.savingsLabel ?? "",
      mealSlotIds: bundle.mealSlotIds,
      sortOrder: bundle.sortOrder,
    });
    setBundleEditorOpen(true);
  };

  const saveBundle = async () => {
    if (!bundleForm || readOnly) return;
    if (!bundleForm.name.trim() || !bundleForm.mealSlotIds.length) {
      setError("Bundle name and at least one meal slot are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: UpsertBundleInput = {
        id: bundleForm.id,
        name: bundleForm.name.trim(),
        price: Number(bundleForm.price) || 0,
        savingsLabel: bundleForm.savingsLabel.trim() || undefined,
        mealSlotIds: bundleForm.mealSlotIds,
        sortOrder: bundleForm.sortOrder,
        status: "ACTIVE",
      };
      await mealSlotsApi.upsertBundle(planId, payload);
      setBundleEditorOpen(false);
      setBundleForm(null);
      await load();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to save bundle";
      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

  const removeBundle = async (bundleId: string) => {
    if (readOnly) return;
    if (!window.confirm("Deactivate this bundle?")) return;
    setSaving(true);
    try {
      await mealSlotsApi.removeBundle(planId, bundleId);
      await load();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to remove bundle";
      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
        Loading meal slots…
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-violet-100 bg-violet-50/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-violet-700">
            Meal slots & bundles
          </h3>
          <p className="mt-1 text-xs text-gray-600">
            Lunch/Dinner options shown in the mobile checkout. Dishes still come from the live menu
            at customization time.
          </p>
        </div>
        {!readOnly && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={openCreateSlot}
              disabled={saving || !deliverySlots.length}
              className="inline-flex items-center gap-1 rounded-lg bg-violet-700 px-3 py-2 text-xs font-bold text-white hover:bg-violet-800 disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              Add slot
            </button>
            <button
              type="button"
              onClick={openCreateBundle}
              disabled={saving || mealSlots.length < 2}
              className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50 disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              Add bundle
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!deliverySlots.length && (
        <p className="text-xs text-amber-700">
          Create delivery slots first under Delivery Slots before adding meal slots.
        </p>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Meal slots</p>
        {mealSlots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-sm text-gray-500">
            No meal slots yet. Add Lunch and Dinner so customers can pick slots at checkout.
          </p>
        ) : (
          mealSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 shrink-0 text-violet-600" />
                  <p className="font-bold text-gray-900">
                    {slot.name}{" "}
                    <span className="text-xs font-medium text-gray-400">({slot.mealType})</span>
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  ₹{slot.basePrice.toLocaleString("en-IN")} ·{" "}
                  {slot.deliveryWindow ? formatDeliverySlotWindow(slot.deliveryWindow) : "No window"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  Customize: {formatCutoffRule(slot.customizationCutoffRule)} · Skip:{" "}
                  {formatCutoffRule(slot.skipCutoffRule)}
                </p>
              </div>
              {!readOnly && (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEditSlot(slot)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeSlot(slot.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bundles</p>
        {bundles.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-sm text-gray-500">
            Optional combo pricing when customers select multiple meal slots together.
          </p>
        ) : (
          bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3"
            >
              <div>
                <p className="font-bold text-gray-900">{bundle.name}</p>
                <p className="mt-1 text-sm text-gray-600">
                  ₹{bundle.price.toLocaleString("en-IN")}
                  {bundle.savingsLabel ? ` · ${bundle.savingsLabel}` : ""}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {bundle.mealSlotIds.map((id) => slotLabelMap.get(id) ?? id).join(" + ")}
                </p>
              </div>
              {!readOnly && (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEditBundle(bundle)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeBundle(bundle.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {slotEditorOpen && slotForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="text-lg font-bold text-gray-900">
              {slotForm.id ? "Edit meal slot" : "Add meal slot"}
            </h4>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Meal type</span>
                  <select
                    value={slotForm.mealType}
                    onChange={(e) => {
                      const mealType = e.target.value as MealSlotForm["mealType"];
                      setSlotForm((f) =>
                        f
                          ? {
                              ...f,
                              mealType,
                              name: MEAL_TYPE_OPTIONS.find((o) => o.value === mealType)?.label ?? f.name,
                              mealScheduleKey: mealType.toLowerCase(),
                            }
                          : f,
                      );
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  >
                    {MEAL_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Base price (₹)</span>
                  <input
                    type="number"
                    min={0}
                    value={slotForm.basePrice}
                    onChange={(e) =>
                      setSlotForm((f) => (f ? { ...f, basePrice: Number(e.target.value) } : f))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Display name</span>
                <input
                  value={slotForm.name}
                  onChange={(e) => setSlotForm((f) => (f ? { ...f, name: e.target.value } : f))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Delivery slot</span>
                <select
                  value={slotForm.deliverySlotId}
                  onChange={(e) =>
                    setSlotForm((f) => (f ? { ...f, deliverySlotId: e.target.value } : f))
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                >
                  <option value="">Select slot…</option>
                  {deliverySlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.name} ({formatDeliverySlotLabel(slot.startTime, slot.endTime)})
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <CutoffFields
                  label="Customization cutoff"
                  mode={slotForm.customizationMode}
                  time={slotForm.customizationTime}
                  hours={slotForm.customizationHours}
                  onModeChange={(mode) =>
                    setSlotForm((f) => (f ? { ...f, customizationMode: mode } : f))
                  }
                  onTimeChange={(time) =>
                    setSlotForm((f) => (f ? { ...f, customizationTime: time } : f))
                  }
                  onHoursChange={(hours) =>
                    setSlotForm((f) => (f ? { ...f, customizationHours: hours } : f))
                  }
                />
                <CutoffFields
                  label="Skip cutoff"
                  mode={slotForm.skipMode}
                  time={slotForm.skipTime}
                  hours={slotForm.skipHours}
                  onModeChange={(mode) => setSlotForm((f) => (f ? { ...f, skipMode: mode } : f))}
                  onTimeChange={(time) => setSlotForm((f) => (f ? { ...f, skipTime: time } : f))}
                  onHoursChange={(hours) =>
                    setSlotForm((f) => (f ? { ...f, skipHours: hours } : f))
                  }
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSlotEditorOpen(false);
                    setSlotForm(null);
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveSlot()}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save slot"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bundleEditorOpen && bundleForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="text-lg font-bold text-gray-900">
              {bundleForm.id ? "Edit bundle" : "Add bundle"}
            </h4>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Bundle name</span>
                <input
                  value={bundleForm.name}
                  onChange={(e) =>
                    setBundleForm((f) => (f ? { ...f, name: e.target.value } : f))
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  placeholder="Lunch + Dinner"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Bundle price (₹)</span>
                  <input
                    type="number"
                    min={0}
                    value={bundleForm.price}
                    onChange={(e) =>
                      setBundleForm((f) => (f ? { ...f, price: Number(e.target.value) } : f))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Savings label</span>
                  <input
                    value={bundleForm.savingsLabel}
                    onChange={(e) =>
                      setBundleForm((f) => (f ? { ...f, savingsLabel: e.target.value } : f))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                    placeholder="Save ₹499"
                  />
                </label>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Included meal slots</p>
                <div className="space-y-1.5">
                  {mealSlots.map((slot) => (
                    <label key={slot.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={bundleForm.mealSlotIds.includes(slot.id)}
                        onChange={(e) => {
                          setBundleForm((f) => {
                            if (!f) return f;
                            const next = e.target.checked
                              ? [...f.mealSlotIds, slot.id]
                              : f.mealSlotIds.filter((id) => id !== slot.id);
                            return { ...f, mealSlotIds: next };
                          });
                        }}
                      />
                      {slot.name} (₹{slot.basePrice})
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBundleEditorOpen(false);
                    setBundleForm(null);
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveBundle()}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save bundle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
