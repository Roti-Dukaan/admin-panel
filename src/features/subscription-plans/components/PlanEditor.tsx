"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Save, ArrowLeft } from "lucide-react";
import { isAxiosError } from "axios";
import {
  CARRY_FORWARD_LABELS,
  CreateSubscriptionPlanInput,
  DISCOUNT_TYPE_LABELS,
  EMPTY_PLAN,
  formatPlanPrice,
  parsePlanPrice,
  PLAN_TYPE_LABELS,
  previewFinalPrice,
  SubscriptionPlan,
  SubscriptionPlanItemRules,
  SubscriptionPlanType,
  PlanDiscountType,
  CarryForwardMode,
} from "@/features/subscription-plans/types/subscription-plan";
import { DescriptionBulletTextarea } from "@/components/ui/description-bullet-textarea";
import { useSubscriptionPlanStore } from "@/features/subscription-plans/hooks/useSubscriptionPlans";

type PlanFormState = CreateSubscriptionPlanInput & { itemRulesJson: string };

function formatDateInput(value?: string | Date | null): string {
  if (!value) return "";
  const str = typeof value === "string" ? value : value.toISOString();
  return str.slice(0, 10);
}

function planToForm(plan: SubscriptionPlan): PlanFormState {
  const basePrice = parsePlanPrice(plan.originalPrice ?? plan.price);
  const discountType = plan.configDiscountType ?? plan.discountType ?? "NONE";
  const discountValue = plan.configDiscountValue ?? plan.discountValue ?? 0;
  const isDiscountActive = plan.configIsDiscountActive ?? plan.isDiscountActive ?? false;

  return {
    name: plan.name,
    slug: plan.slug ?? "",
    description: plan.description ?? "",
    type: plan.type,
    price: basePrice,
    validityDays: plan.validityDays,
    deliveriesPerCycle: plan.deliveriesPerCycle,
    itemRules: plan.itemRules,
    itemRulesJson: JSON.stringify(plan.itemRules ?? {}, null, 2),
    isActive: plan.isActive,
    displayOrder: plan.displayOrder,
    badge: plan.badge ?? "",
    skipEnabled: plan.skipEnabled,
    monthlySkipLimit: plan.monthlySkipLimit,
    weeklySkipLimit: plan.weeklySkipLimit,
    maxSkipDaysPerCycle: plan.maxSkipDaysPerCycle,
    skipCutoffHours: plan.skipCutoffHours,
    carryForwardEnabled: plan.carryForwardEnabled,
    carryForwardMode: plan.carryForwardMode,
    allowAdminOverride: plan.allowAdminOverride,
    discountType,
    discountValue,
    discountLabel: plan.configDiscountLabel ?? plan.discountLabel ?? "",
    discountStartDate: formatDateInput(plan.discountStartDate),
    discountEndDate: formatDateInput(plan.discountEndDate),
    isDiscountActive,
  };
}

function formToPayload(form: PlanFormState): CreateSubscriptionPlanInput {
  let itemRules: SubscriptionPlanItemRules | undefined;
  try {
    const parsed = JSON.parse(form.itemRulesJson || "{}");
    if (Object.keys(parsed).length > 0) {
      itemRules = parsed;
    }
  } catch {
    itemRules = form.itemRules ?? undefined;
  }

  const discountType = form.discountType ?? "NONE";
  const isDiscountActive = form.isDiscountActive ?? false;
  const discountValue =
    discountType === "NONE" ? 0 : Number(form.discountValue) || 0;

  return {
    name: form.name.trim(),
    slug: form.slug?.trim() || undefined,
    description: form.description?.trim() || undefined,
    type: form.type,
    price: Number(form.price),
    validityDays: Number(form.validityDays),
    deliveriesPerCycle: Number(form.deliveriesPerCycle),
    itemRules,
    isActive: form.isActive,
    displayOrder: Number(form.displayOrder),
    badge: form.badge?.trim() || undefined,
    skipEnabled: form.skipEnabled,
    monthlySkipLimit: Number(form.monthlySkipLimit),
    weeklySkipLimit: Number(form.weeklySkipLimit),
    maxSkipDaysPerCycle: Number(form.maxSkipDaysPerCycle),
    skipCutoffHours: Number(form.skipCutoffHours),
    carryForwardEnabled: form.carryForwardEnabled,
    carryForwardMode: form.carryForwardMode,
    allowAdminOverride: form.allowAdminOverride,
    discountType,
    discountValue,
    discountLabel: form.discountLabel?.trim() || undefined,
    discountStartDate: form.discountStartDate || undefined,
    discountEndDate: form.discountEndDate || undefined,
    isDiscountActive: isDiscountActive && discountType !== "NONE",
  };
}

export function PlanEditor() {
  const editorOpen = useSubscriptionPlanStore((s) => s.editorOpen);
  const editorMode = useSubscriptionPlanStore((s) => s.editorMode);
  const selectedPlan = useSubscriptionPlanStore((s) => s.selectedPlan);
  const closeEditor = useSubscriptionPlanStore((s) => s.closeEditor);
  const addPlan = useSubscriptionPlanStore((s) => s.addPlan);
  const updatePlan = useSubscriptionPlanStore((s) => s.updatePlan);

  const isViewOnly = editorMode === "view";
  const [localForm, setLocalForm] = useState<PlanFormState>({
    ...EMPTY_PLAN,
    itemRulesJson: JSON.stringify(EMPTY_PLAN.itemRules ?? {}, null, 2),
  });
  const [itemRulesError, setItemRulesError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editorOpen) {
      setLocalForm(
        selectedPlan
          ? planToForm(selectedPlan)
          : {
              ...EMPTY_PLAN,
              itemRulesJson: JSON.stringify(EMPTY_PLAN.itemRules ?? {}, null, 2),
            }
      );
      setItemRulesError(null);
      setFormError(null);
    }
  }, [editorOpen, selectedPlan]);

  const pricePreview = useMemo(
    () =>
      previewFinalPrice(
        Number(localForm.price) || 0,
        localForm.discountType ?? "NONE",
        Number(localForm.discountValue) || 0,
        localForm.isDiscountActive ?? false
      ),
    [localForm.price, localForm.discountType, localForm.discountValue, localForm.isDiscountActive]
  );

  const updateField = <K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) => {
    setLocalForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  const validateForm = (): string | null => {
    const price = Number(localForm.price) || 0;
    const discountType = localForm.discountType ?? "NONE";
    const isDiscountActive = localForm.isDiscountActive ?? false;
    const discountValue = Number(localForm.discountValue) || 0;

    if (isDiscountActive && discountType === "PERCENTAGE" && discountValue > 100) {
      return "Percentage discount cannot exceed 100";
    }
    if (isDiscountActive && discountType === "FLAT" && discountValue > price) {
      return "Flat discount cannot exceed base price";
    }

    if ((localForm.monthlySkipLimit ?? 0) < 0 || (localForm.weeklySkipLimit ?? 0) < 0) {
      return "Skip limits must be ≥ 0";
    }
    return null;
  };

  const handleSave = async () => {
    if (!localForm.name.trim()) return;

    try {
      JSON.parse(localForm.itemRulesJson || "{}");
    } catch {
      setItemRulesError("Item rules must be valid JSON");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setItemRulesError(null);
    setFormError(null);
    setSaving(true);

    try {
      const payload = formToPayload(localForm);
      if (editorMode === "create") {
        await addPlan(payload);
      } else if (editorMode === "edit" && selectedPlan) {
        await updatePlan(selectedPlan.id, payload);
      }
      closeEditor();
    } catch (error) {
      if (isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;
        const apiErrors = error.response?.data?.errors;
        if (Array.isArray(apiErrors) && apiErrors.length > 0) {
          setFormError(apiErrors.join(", "));
        } else if (typeof apiMessage === "string" && apiMessage.trim()) {
          setFormError(apiMessage);
        } else {
          setFormError("Failed to save subscription plan. Please check your inputs and try again.");
        }
      } else if (error instanceof Error && error.message) {
        setFormError(error.message);
      } else {
        setFormError("Failed to save subscription plan. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!editorOpen) return null;

  const editorTitle =
    editorMode === "create"
      ? "Create New Plan"
      : editorMode === "edit"
        ? `Edit: ${selectedPlan?.name ?? "Plan"}`
        : `View: ${selectedPlan?.name ?? "Plan"}`;

  const inputClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all";

  const toggleClass = (active: boolean) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      active ? "bg-orange-500" : "bg-gray-300"
    } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={closeEditor}
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={closeEditor}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editorTitle}</h2>
                <p className="text-xs text-gray-500">
                  {isViewOnly ? "View-only mode" : "Configure plan, skip rules, and discount settings"}
                </p>
              </div>
            </div>
            {!isViewOnly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={closeEditor}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !localForm.name.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : editorMode === "create" ? "Create Plan" : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-xl space-y-6">
              {formError && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
              )}

              {selectedPlan?.razorpayPlanId && (
                <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                    Razorpay Integration
                  </h3>
                  <code className="mt-2 block break-all rounded-lg bg-white px-3 py-2 text-xs text-gray-800">
                    {selectedPlan.razorpayPlanId}
                  </code>
                </section>
              )}

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">General</h3>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Plan Name</label>
                  <input
                    type="text"
                    value={localForm.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    disabled={isViewOnly}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Billing Cycle</label>
                    <select
                      value={localForm.type}
                      onChange={(e) => updateField("type", e.target.value as SubscriptionPlanType)}
                      disabled={isViewOnly}
                      className={inputClass}
                    >
                      {(Object.keys(PLAN_TYPE_LABELS) as SubscriptionPlanType[]).map((type) => (
                        <option key={type} value={type}>
                          {PLAN_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Badge / Tag</label>
                    <input
                      type="text"
                      value={localForm.badge ?? ""}
                      onChange={(e) => updateField("badge", e.target.value)}
                      disabled={isViewOnly}
                      placeholder="e.g. Best Value"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Description</label>
                  <DescriptionBulletTextarea
                    value={localForm.description ?? ""}
                    onChange={(description) => updateField("description", description)}
                    disabled={isViewOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Display Order</label>
                    <input
                      type="number"
                      value={localForm.displayOrder ?? 0}
                      onChange={(e) => updateField("displayOrder", parseInt(e.target.value, 10) || 0)}
                      disabled={isViewOnly}
                      min={0}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                      <p className="text-sm font-semibold text-gray-900">Active</p>
                      <button
                        onClick={() => !isViewOnly && updateField("isActive", !localForm.isActive)}
                        disabled={isViewOnly}
                        className={toggleClass(localForm.isActive ?? true)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            localForm.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">Pricing & Cycle</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Base Price (INR)</label>
                    <input
                      type="number"
                      value={localForm.price}
                      onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                      disabled={isViewOnly}
                      min={0}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Validity Days</label>
                    <input
                      type="number"
                      value={localForm.validityDays}
                      onChange={(e) => updateField("validityDays", parseInt(e.target.value, 10) || 1)}
                      disabled={isViewOnly}
                      min={1}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Deliveries/Cycle</label>
                    <input
                      type="number"
                      value={localForm.deliveriesPerCycle}
                      onChange={(e) =>
                        updateField("deliveriesPerCycle", parseInt(e.target.value, 10) || 1)
                      }
                      disabled={isViewOnly}
                      min={1}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-orange-600">Discount</h3>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Discount Active</p>
                  <button
                    onClick={() => !isViewOnly && updateField("isDiscountActive", !localForm.isDiscountActive)}
                    disabled={isViewOnly}
                    className={toggleClass(localForm.isDiscountActive ?? false)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localForm.isDiscountActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Discount Type</label>
                    <select
                      value={localForm.discountType ?? "NONE"}
                      onChange={(e) => updateField("discountType", e.target.value as PlanDiscountType)}
                      disabled={isViewOnly}
                      className={inputClass}
                    >
                      {(Object.keys(DISCOUNT_TYPE_LABELS) as PlanDiscountType[]).map((t) => (
                        <option key={t} value={t}>
                          {DISCOUNT_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Discount Value</label>
                    <input
                      type="number"
                      value={localForm.discountValue ?? 0}
                      onChange={(e) => updateField("discountValue", parseFloat(e.target.value) || 0)}
                      disabled={isViewOnly || localForm.discountType === "NONE"}
                      min={0}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Discount Label</label>
                  <input
                    type="text"
                    value={localForm.discountLabel ?? ""}
                    onChange={(e) => updateField("discountLabel", e.target.value)}
                    disabled={isViewOnly}
                    placeholder="e.g. Launch Offer"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Start Date</label>
                    <input
                      type="date"
                      value={localForm.discountStartDate ?? ""}
                      onChange={(e) => updateField("discountStartDate", e.target.value)}
                      disabled={isViewOnly}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">End Date</label>
                    <input
                      type="date"
                      value={localForm.discountEndDate ?? ""}
                      onChange={(e) => updateField("discountEndDate", e.target.value)}
                      disabled={isViewOnly}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-orange-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">Live Price Preview</p>
                  <div className="mt-2 flex items-end gap-3">
                    {pricePreview.savingsAmount > 0 && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPlanPrice(localForm.price)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPlanPrice(pricePreview.finalPrice)}
                    </span>
                  </div>
                  {pricePreview.savingsAmount > 0 && (
                    <p className="mt-1 text-sm text-emerald-600">
                      Customer saves {formatPlanPrice(pricePreview.savingsAmount)}
                    </p>
                  )}
                </div>
              </section>

              <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-blue-600">Skip Configuration</h3>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Skip Enabled</p>
                  <button
                    onClick={() => !isViewOnly && updateField("skipEnabled", !localForm.skipEnabled)}
                    disabled={isViewOnly}
                    className={toggleClass(localForm.skipEnabled ?? true)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localForm.skipEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Weekly Skip Limit</label>
                    <input
                      type="number"
                      value={localForm.weeklySkipLimit ?? 1}
                      onChange={(e) => updateField("weeklySkipLimit", parseInt(e.target.value, 10) || 0)}
                      disabled={isViewOnly}
                      min={0}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Monthly Skip Limit</label>
                    <input
                      type="number"
                      value={localForm.monthlySkipLimit ?? 2}
                      onChange={(e) => updateField("monthlySkipLimit", parseInt(e.target.value, 10) || 0)}
                      disabled={isViewOnly}
                      min={0}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Max Skip Days / Cycle</label>
                    <input
                      type="number"
                      value={localForm.maxSkipDaysPerCycle ?? 2}
                      onChange={(e) => updateField("maxSkipDaysPerCycle", parseInt(e.target.value, 10) || 0)}
                      disabled={isViewOnly}
                      min={0}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Skip Cutoff (hours)</label>
                    <input
                      type="number"
                      value={localForm.skipCutoffHours ?? 12}
                      onChange={(e) => updateField("skipCutoffHours", parseInt(e.target.value, 10) || 0)}
                      disabled={isViewOnly}
                      min={0}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Carry Forward Enabled</p>
                    <p className="text-xs text-gray-500">Extend subscription when customer skips</p>
                  </div>
                  <button
                    onClick={() => !isViewOnly && updateField("carryForwardEnabled", !localForm.carryForwardEnabled)}
                    disabled={isViewOnly}
                    className={toggleClass(localForm.carryForwardEnabled ?? false)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localForm.carryForwardEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Carry Forward Mode</label>
                  <select
                    value={localForm.carryForwardMode ?? "EXTEND_END_DATE"}
                    onChange={(e) => updateField("carryForwardMode", e.target.value as CarryForwardMode)}
                    disabled={isViewOnly}
                    className={inputClass}
                  >
                    {(Object.keys(CARRY_FORWARD_LABELS) as CarryForwardMode[]).map((m) => (
                      <option key={m} value={m}>
                        {CARRY_FORWARD_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Allow Admin Override</p>
                  <button
                    onClick={() => !isViewOnly && updateField("allowAdminOverride", !localForm.allowAdminOverride)}
                    disabled={isViewOnly}
                    className={toggleClass(localForm.allowAdminOverride ?? true)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localForm.allowAdminOverride ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">Item Rules</h3>
                <textarea
                  value={localForm.itemRulesJson}
                  onChange={(e) => {
                    updateField("itemRulesJson", e.target.value);
                    setItemRulesError(null);
                  }}
                  disabled={isViewOnly}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-xs"
                />
                {itemRulesError && <p className="text-xs text-red-600">{itemRulesError}</p>}
              </section>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
