"use client";

import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { ArrowLeft, Plus, Save, Search, X } from "lucide-react";
import { ProductPickerDialog } from "@/features/app-home-page/components/ProductPickerDialog";
import { MealSlotsPanel } from "./MealSlotsPanel";
import { packagesApi } from "../services/packages.api";
import { DescriptionBulletTextarea } from "@/components/ui/description-bullet-textarea";
import type { ApiFoodItem } from "@/lib/types/api";
import {
  CreateSubscriptionPackageInput,
  PlanCategoryLimits,
  PlanCustomizationRules,
  SubscriptionPackage,
  SubscriptionPlanType,
} from "../types/subscription-package";

type LimitsForm = PlanCategoryLimits & { allowMultipleSelections: boolean };

type PackageForm = {
  name: string;
  description: string;
  badge: string;
  billingCycle: SubscriptionPlanType;
  validityDays: number;
  deliveriesPerCycle: number;
  active: boolean;
  displayOrder: number;
  selectionCutoffHours: number;
  skipEnabled: boolean;
  weeklySkipLimit: number;
  monthlySkipLimit: number;
  maxSkipDaysPerCycle: number;
  skipCutoffHours: number;
  foodItemIds: string[];
  limits: {
    roti: LimitsForm;
    curry: LimitsForm;
    addon: LimitsForm;
  };
};


const defaultCategoryLimits = (): PackageForm["limits"] => ({
  roti: {
    includedQuantityPerDelivery: 4,
    maximumQuantityPerDelivery: 8,
    maximumChoicesPerDelivery: 2,
    allowMultipleSelections: true,
  },
  curry: {
    includedQuantityPerDelivery: 1,
    maximumQuantityPerDelivery: 2,
    maximumChoicesPerDelivery: 1,
    allowMultipleSelections: false,
  },
  addon: {
    includedQuantityPerDelivery: 1,
    maximumQuantityPerDelivery: 3,
    maximumChoicesPerDelivery: 1,
    allowMultipleSelections: false,
  },
});

function emptyForm(): PackageForm {
  return {
    name: "",
    description: "",
    badge: "",
    billingCycle: "MONTHLY",
    validityDays: 30,
    deliveriesPerCycle: 30,
    active: true,
    displayOrder: 0,
    selectionCutoffHours: 24,
    skipEnabled: true,
    weeklySkipLimit: 1,
    monthlySkipLimit: 2,
    maxSkipDaysPerCycle: 2,
    skipCutoffHours: 12,
    foodItemIds: [],
    limits: defaultCategoryLimits(),
  };
}

function parseLimitsFromPackage(
  rules: SubscriptionPackage["customizationRules"],
): PackageForm["limits"] {
  const base = defaultCategoryLimits();
  if (!rules || typeof rules !== "object") return base;

  const read = (key: "roti" | "curry" | "addon", fallback: LimitsForm): LimitsForm => {
    const raw = (rules as Record<string, PlanCategoryLimits>)[key]
      ?? (rules as Record<string, PlanCategoryLimits>)[key.toUpperCase()];
    if (!raw) return fallback;
    const maxChoices = raw.maximumChoicesPerDelivery ?? fallback.maximumChoicesPerDelivery;
    return {
      includedQuantityPerDelivery: raw.includedQuantityPerDelivery ?? fallback.includedQuantityPerDelivery,
      maximumQuantityPerDelivery: raw.maximumQuantityPerDelivery ?? fallback.maximumQuantityPerDelivery,
      maximumChoicesPerDelivery: maxChoices,
      allowMultipleSelections: maxChoices > 1,
    };
  };

  return {
    roti: read("roti", base.roti),
    curry: read("curry", base.curry),
    addon: read("addon", base.addon),
  };
}

function packageToForm(pkg: SubscriptionPackage): PackageForm {
  const base = emptyForm();
  base.name = pkg.name;
  base.description = pkg.description ?? "";
  base.badge = pkg.badge ?? "";
  base.billingCycle = pkg.billingCycle ?? pkg.type;
  base.validityDays = pkg.validityDays;
  base.deliveriesPerCycle = pkg.deliveriesPerCycle;
  base.active = pkg.active ?? pkg.isActive;
  base.displayOrder = pkg.displayOrder;
  base.selectionCutoffHours = pkg.selectionCutoffHours ?? 24;
  base.skipEnabled = pkg.skipEnabled ?? true;
  base.weeklySkipLimit = pkg.weeklySkipLimit ?? 1;
  base.monthlySkipLimit = pkg.monthlySkipLimit ?? 2;
  base.maxSkipDaysPerCycle = pkg.maxSkipDaysPerCycle ?? 2;
  base.skipCutoffHours = pkg.skipCutoffHours ?? 12;
  base.foodItemIds = pkg.foodItemIds ?? pkg.allowedFoodItems?.map((row) => row.foodItemId) ?? [];
  base.limits = parseLimitsFromPackage(pkg.customizationRules);
  return base;
}

function toCustomizationRules(limits: PackageForm["limits"]): PlanCustomizationRules {
  const pack = (entry: LimitsForm): PlanCategoryLimits => ({
    includedQuantityPerDelivery: Number(entry.includedQuantityPerDelivery) || 0,
    maximumQuantityPerDelivery: Number(entry.maximumQuantityPerDelivery) || 1,
    maximumChoicesPerDelivery: entry.allowMultipleSelections
      ? Math.max(Number(entry.maximumChoicesPerDelivery) || 2, 2)
      : 1,
  });
  return {
    roti: pack(limits.roti),
    curry: pack(limits.curry),
    addon: pack(limits.addon),
  };
}

function formToPayload(form: PackageForm): CreateSubscriptionPackageInput {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    badge: form.badge.trim() || undefined,
    billingCycle: form.billingCycle,
    validityDays: Number(form.validityDays),
    deliveriesPerCycle: Number(form.deliveriesPerCycle),
    active: form.active,
    displayOrder: Number(form.displayOrder) || 0,
    selectionCutoffHours: Number(form.selectionCutoffHours) || 24,
    skipEnabled: form.skipEnabled,
    weeklySkipLimit: Number(form.weeklySkipLimit) || 0,
    monthlySkipLimit: Number(form.monthlySkipLimit) || 0,
    maxSkipDaysPerCycle: Number(form.maxSkipDaysPerCycle) || 0,
    skipCutoffHours: Number(form.skipCutoffHours) || 12,
    availableDeliveryDays: [],
    availableDeliverySlots: [],
    foodItemIds: form.foodItemIds,
    customizationRules: toCustomizationRules(form.limits),
  };
}

interface PackageEditorProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  selected: SubscriptionPackage | null;
  onClose: () => void;
  onSaved: () => void;
}

function LimitFields({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: LimitsForm;
  disabled: boolean;
  onChange: (patch: Partial<LimitsForm>) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Included qty / delivery</span>
          <input
            disabled={disabled}
            type="number"
            min={0}
            value={value.includedQuantityPerDelivery}
            onChange={(e) => onChange({ includedQuantityPerDelivery: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Max qty / delivery</span>
          <input
            disabled={disabled}
            type="number"
            min={1}
            value={value.maximumQuantityPerDelivery}
            onChange={(e) => onChange({ maximumQuantityPerDelivery: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          />
        </label>
      </div>
      <label className="mt-3 flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          disabled={disabled}
          checked={value.allowMultipleSelections}
          onChange={(e) =>
            onChange({
              allowMultipleSelections: e.target.checked,
              maximumChoicesPerDelivery: e.target.checked
                ? Math.max(value.maximumChoicesPerDelivery, 2)
                : 1,
            })
          }
          className="mt-0.5"
        />
        <span>
          <span className="block font-medium text-gray-800">Allow multiple item selections</span>
          <span className="block text-xs text-gray-500">
            When enabled, customers can pick more than one dish in this group per delivery.
          </span>
        </span>
      </label>
      {value.allowMultipleSelections && (
        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Max different items per delivery</span>
          <input
            disabled={disabled}
            type="number"
            min={2}
            value={value.maximumChoicesPerDelivery}
            onChange={(e) => onChange({ maximumChoicesPerDelivery: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          />
        </label>
      )}
    </div>
  );
}

export function PackageEditor({ open, mode, selected, onClose, onSaved }: PackageEditorProps) {
  const [form, setForm] = useState<PackageForm>(emptyForm());
  const [selectedItems, setSelectedItems] = useState<ApiFoodItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isViewOnly = mode === "view";

  useEffect(() => {
    if (!open) return;
    setError(null);
    const nextForm = selected ? packageToForm(selected) : emptyForm();
    setForm(nextForm);
    setSelectedItems(
      (selected?.allowedFoodItems ?? []).map((row) => ({
        id: row.foodItem.id,
        categoryId: row.foodItem.category?.id ?? "",
        name: row.foodItem.name,
        slug: row.foodItem.slug,
        sku: null,
        shortDescription: null,
        description: null,
        basePrice: 0,
        discountPrice: null,
        imageUrl: row.foodItem.imageUrl,
        gallery: [],
        isVeg: row.foodItem.isVeg,
        isFeatured: false,
        isAvailable: row.foodItem.isAvailable,
        isSubscriptionAvailable: row.foodItem.isSubscriptionAvailable,
        preparationTime: 0,
        calories: null,
        protein: null,
        carbs: null,
        fats: null,
        fiber: null,
        servingSize: row.foodItem.servingSize,
        sortOrder: row.displayOrder,
        metaTitle: null,
        metaDescription: null,
        searchKeywords: [],
        createdBy: null,
        updatedBy: null,
        createdAt: "",
        updatedAt: "",
        deletedAt: null,
      })),
    );
  }, [open, selected]);

  const filteredSelectedItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return selectedItems;
    return selectedItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [itemSearch, selectedItems]);

  if (!open) return null;

  const updateLimits = (key: keyof PackageForm["limits"], patch: Partial<LimitsForm>) => {
    setForm((prev) => ({
      ...prev,
      limits: {
        ...prev.limits,
        [key]: { ...prev.limits[key], ...patch },
      },
    }));
  };

  const removeItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      foodItemIds: prev.foodItemIds.filter((itemId) => itemId !== id),
    }));
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const onSave = async () => {
    if (isViewOnly) return;
    if (!form.name.trim()) {
      setError("Package name is required");
      return;
    }
    if (!form.foodItemIds.length) {
      setError("Select at least one menu item for this plan");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = formToPayload(form);
      if (mode === "edit" && selected) {
        await packagesApi.update(selected.id, payload);
      } else {
        await packagesApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to save package";
      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
        <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {mode === "create"
                    ? "Create Subscription Plan"
                    : mode === "edit"
                      ? `Edit: ${form.name || "Plan"}`
                      : `View: ${form.name || "Plan"}`}
                </h2>
                <p className="text-sm text-gray-500">
                  {isViewOnly
                    ? "View-only mode"
                    : "Choose allowed menu items and configure meal slots for pricing"}
                </p>
              </div>
            </div>
            {!isViewOnly && (
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Plan"}
              </button>
            )}
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Plan information</h3>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Plan name</span>
                <input
                  disabled={isViewOnly}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  placeholder="Monthly Meal Plan"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Description</span>
                <DescriptionBulletTextarea
                  disabled={isViewOnly}
                  value={form.description}
                  onChange={(description) => setForm((f) => ({ ...f, description }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Billing cycle</span>
                  <select
                    disabled={isViewOnly}
                    value={form.billingCycle}
                    onChange={(e) => {
                      const billingCycle = e.target.value as SubscriptionPlanType;
                      setForm((f) => ({
                        ...f,
                        billingCycle,
                        validityDays: billingCycle === "WEEKLY" ? 7 : 30,
                        deliveriesPerCycle: billingCycle === "WEEKLY" ? 6 : 30,
                      }));
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">
                    Selection cutoff (hours before delivery day starts)
                  </span>
                  <input
                    disabled={isViewOnly}
                    type="number"
                    min={1}
                    value={form.selectionCutoffHours}
                    onChange={(e) => setForm((f) => ({ ...f, selectionCutoffHours: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Validity days</span>
                  <input
                    disabled={isViewOnly}
                    type="number"
                    min={1}
                    value={form.validityDays}
                    onChange={(e) => setForm((f) => ({ ...f, validityDays: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Deliveries per cycle</span>
                  <input
                    disabled={isViewOnly}
                    type="number"
                    min={1}
                    value={form.deliveriesPerCycle}
                    onChange={(e) => setForm((f) => ({ ...f, deliveriesPerCycle: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  disabled={isViewOnly}
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={isViewOnly}
                    checked={form.badge.trim().length > 0}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        badge: e.target.checked ? "Most Popular" : "",
                      }))
                    }
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block font-medium text-gray-700">Show badge on mobile</span>
                    <span className="block text-xs text-gray-500">Highlights this plan in the catalog.</span>
                  </span>
                </label>
                {form.badge.trim().length > 0 && (
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-gray-700">Badge text</span>
                    <input
                      disabled={isViewOnly}
                      value={form.badge}
                      onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                      placeholder="Most Popular"
                    />
                  </label>
                )}
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-blue-600">Skip configuration</h3>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  disabled={isViewOnly}
                  checked={form.skipEnabled}
                  onChange={(e) => setForm((f) => ({ ...f, skipEnabled: e.target.checked }))}
                />
                Allow customers to skip deliveries
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Weekly skip limit</span>
                  <input
                    disabled={isViewOnly || !form.skipEnabled}
                    type="number"
                    min={0}
                    value={form.weeklySkipLimit}
                    onChange={(e) => setForm((f) => ({ ...f, weeklySkipLimit: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 disabled:bg-gray-100"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Monthly skip limit</span>
                  <input
                    disabled={isViewOnly || !form.skipEnabled}
                    type="number"
                    min={0}
                    value={form.monthlySkipLimit}
                    onChange={(e) => setForm((f) => ({ ...f, monthlySkipLimit: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 disabled:bg-gray-100"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Max skip days / cycle</span>
                  <input
                    disabled={isViewOnly || !form.skipEnabled}
                    type="number"
                    min={0}
                    value={form.maxSkipDaysPerCycle}
                    onChange={(e) => setForm((f) => ({ ...f, maxSkipDaysPerCycle: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 disabled:bg-gray-100"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Skip cutoff (hours)</span>
                  <input
                    disabled={isViewOnly || !form.skipEnabled}
                    type="number"
                    min={0}
                    value={form.skipCutoffHours}
                    onChange={(e) => setForm((f) => ({ ...f, skipCutoffHours: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 disabled:bg-gray-100"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Allowed menu items</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Pick which dishes from Menu Items customers can choose at customization time.
                  </p>
                </div>
                {!isViewOnly && (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add items
                  </button>
                )}
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
                <p className="font-semibold">Live menu catalog</p>
                <p className="mt-1 text-emerald-800/90">
                  Only the items you select here appear during daily meal customization. Branch
                  availability still applies at runtime.
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search selected items..."
                  className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm"
                />
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-gray-200 p-3">
                {filteredSelectedItems.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    {form.foodItemIds.length ? "No items match your search" : "No menu items selected yet"}
                  </p>
                ) : (
                  filteredSelectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          ₹{item.discountPrice ?? item.basePrice}
                          {!item.isSubscriptionAvailable ? " · not marked subscription-ready" : ""}
                        </p>
                      </div>
                      {!isViewOnly && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500">
                {form.foodItemIds.length} item{form.foodItemIds.length === 1 ? "" : "s"} allowed
              </p>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  Customization limits
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Quantity rules per food group during daily meal customization. Pricing is set under
                  meal slots below.
                </p>
              </div>
              <LimitFields
                label="Rotis"
                value={form.limits.roti}
                disabled={isViewOnly}
                onChange={(patch) => updateLimits("roti", patch)}
              />
              <LimitFields
                label="Curries"
                value={form.limits.curry}
                disabled={isViewOnly}
                onChange={(patch) => updateLimits("curry", patch)}
              />
              <LimitFields
                label="Add-ons"
                value={form.limits.addon}
                disabled={isViewOnly}
                onChange={(patch) => updateLimits("addon", patch)}
              />
            </section>

            {selected?.id ? (
              <MealSlotsPanel planId={selected.id} readOnly={isViewOnly} />
            ) : (
              <section className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4 text-sm text-violet-900">
                <p className="font-semibold">Meal slots & pricing</p>
                <p className="mt-1 text-violet-800/90">
                  Save the plan first, then reopen it to configure Lunch/Dinner slots, delivery windows,
                  and combo bundle pricing for mobile checkout.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={form.foodItemIds}
        onDone={(ids, products) => {
          setForm((prev) => ({ ...prev, foodItemIds: ids }));
          setSelectedItems(products);
        }}
      />
    </>
  );
}
