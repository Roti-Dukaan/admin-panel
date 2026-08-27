"use client";

import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { ArrowLeft, Save } from "lucide-react";
import { subscriptionMenuCategoriesApi } from "@/features/subscription-menu/services/subscription-menu-categories.api";
import { MealSlotsPanel } from "./MealSlotsPanel";
import { packagesApi } from "../services/packages.api";
import { DescriptionBulletTextarea } from "@/components/ui/description-bullet-textarea";
import {
  CreateSubscriptionPackageInput,
  MenuCategoryDefinition,
  PackageCategoryInput,
  SubscriptionPackage,
  SubscriptionPlanType,
  pricePeriodLabel,
} from "../types/subscription-package";

type CategoryForm = {
  enabled: boolean;
  categoryPrice: number;
  includedQuantityPerDelivery: number;
  maximumQuantityPerDelivery: number;
  allowMultipleSelections: boolean;
  maximumChoicesPerDelivery: number;
};

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
  allowCustomerCategorySelection: boolean;
  skipEnabled: boolean;
  weeklySkipLimit: number;
  monthlySkipLimit: number;
  maxSkipDaysPerCycle: number;
  skipCutoffHours: number;
  categories: Record<string, CategoryForm>;
};

const emptyCategory = (): CategoryForm => ({
  enabled: false,
  categoryPrice: 0,
  includedQuantityPerDelivery: 1,
  maximumQuantityPerDelivery: 1,
  allowMultipleSelections: false,
  maximumChoicesPerDelivery: 1,
});

function buildEmptyCategories(definitions: MenuCategoryDefinition[]): Record<string, CategoryForm> {
  const categories: Record<string, CategoryForm> = {};
  for (const def of definitions) {
    categories[def.id] = {
      ...emptyCategory(),
      enabled: def.slug === "roti" || def.slug === "curry",
      categoryPrice: def.slug === "roti" ? 500 : def.slug === "curry" ? 800 : 0,
      includedQuantityPerDelivery: def.slug === "roti" ? 4 : 1,
      maximumQuantityPerDelivery: def.slug === "roti" ? 8 : def.slug === "curry" ? 2 : 3,
      allowMultipleSelections: def.slug === "roti",
      maximumChoicesPerDelivery: def.slug === "roti" ? 2 : 1,
    };
  }
  return categories;
}

function emptyForm(definitions: MenuCategoryDefinition[] = []): PackageForm {
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
    allowCustomerCategorySelection: false,
    skipEnabled: true,
    weeklySkipLimit: 1,
    monthlySkipLimit: 2,
    maxSkipDaysPerCycle: 2,
    skipCutoffHours: 12,
    categories: buildEmptyCategories(definitions),
  };
}

function packageToForm(pkg: SubscriptionPackage, definitions: MenuCategoryDefinition[]): PackageForm {
  const base = emptyForm(definitions);
  base.name = pkg.name;
  base.description = pkg.description ?? "";
  base.badge = pkg.badge ?? "";
  base.billingCycle = pkg.billingCycle ?? pkg.type;
  base.validityDays = pkg.validityDays;
  base.deliveriesPerCycle = pkg.deliveriesPerCycle;
  base.active = pkg.active ?? pkg.isActive;
  base.displayOrder = pkg.displayOrder;
  base.selectionCutoffHours = pkg.selectionCutoffHours ?? 24;
  base.allowCustomerCategorySelection = pkg.allowCustomerCategorySelection ?? false;
  base.skipEnabled = pkg.skipEnabled ?? true;
  base.weeklySkipLimit = pkg.weeklySkipLimit ?? 1;
  base.monthlySkipLimit = pkg.monthlySkipLimit ?? 2;
  base.maxSkipDaysPerCycle = pkg.maxSkipDaysPerCycle ?? 2;
  base.skipCutoffHours = pkg.skipCutoffHours ?? 12;

  for (const found of pkg.categories ?? []) {
    const key = found.categoryDefinitionId ?? found.categoryDefinition?.id;
    if (!key) continue;
    const maxChoices = found.maximumChoicesPerDelivery ?? 1;
    base.categories[key] = {
      enabled: found.active,
      categoryPrice: Number(found.categoryPrice),
      includedQuantityPerDelivery: found.includedQuantityPerDelivery,
      maximumQuantityPerDelivery: found.maximumQuantityPerDelivery,
      allowMultipleSelections: maxChoices > 1,
      maximumChoicesPerDelivery: maxChoices,
    };
  }
  return base;
}

function formToPayload(form: PackageForm): CreateSubscriptionPackageInput {
  const categories: PackageCategoryInput[] = Object.entries(form.categories).map(
    ([categoryDefinitionId, c]) => ({
      categoryDefinitionId,
      categoryPrice: Number(c.categoryPrice) || 0,
      active: c.enabled,
      includedQuantityPerDelivery: Number(c.includedQuantityPerDelivery) || 1,
      maximumQuantityPerDelivery: Number(c.maximumQuantityPerDelivery) || 1,
      maximumChoicesPerDelivery: c.allowMultipleSelections
        ? Math.max(Number(c.maximumChoicesPerDelivery) || 2, 2)
        : 1,
      // Clear legacy subscription-menu links; dishes come from the live menu.
      menuItemIds: [],
    }),
  );

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
    allowCustomerCategorySelection: form.allowCustomerCategorySelection,
    skipEnabled: form.skipEnabled,
    weeklySkipLimit: Number(form.weeklySkipLimit) || 0,
    monthlySkipLimit: Number(form.monthlySkipLimit) || 0,
    maxSkipDaysPerCycle: Number(form.maxSkipDaysPerCycle) || 0,
    skipCutoffHours: Number(form.skipCutoffHours) || 12,
    availableDeliveryDays: [],
    availableDeliverySlots: [],
    categories,
  };
}

interface PackageEditorProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  selected: SubscriptionPackage | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PackageEditor({ open, mode, selected, onClose, onSaved }: PackageEditorProps) {
  const [form, setForm] = useState<PackageForm>(emptyForm());
  const [categoryDefinitions, setCategoryDefinitions] = useState<MenuCategoryDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isViewOnly = mode === "view";

  useEffect(() => {
    if (!open) return;
    setError(null);
    subscriptionMenuCategoriesApi
      .list(true)
      .then((defs) => {
        setCategoryDefinitions(defs);
        setForm(selected ? packageToForm(selected, defs) : emptyForm(defs));
      })
      .catch(() => {
        setCategoryDefinitions([]);
        setForm(selected ? packageToForm(selected, []) : emptyForm());
      });
  }, [open, selected]);

  const priceLabel = pricePeriodLabel(form.billingCycle);

  const previewTotal = useMemo(
    () =>
      Object.values(form.categories).reduce(
        (sum, c) => (c.enabled ? sum + (Number(c.categoryPrice) || 0) : sum),
        0,
      ),
    [form.categories],
  );

  if (!open) return null;

  const updateCategory = (categoryDefinitionId: string, patch: Partial<CategoryForm>) => {
    setForm((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryDefinitionId]: {
          ...prev.categories[categoryDefinitionId],
          ...patch,
        },
      },
    }));
  };

  const onSave = async () => {
    if (isViewOnly) return;
    if (!form.name.trim()) {
      setError("Package name is required");
      return;
    }
    const enabled = Object.values(form.categories).filter((c) => c.enabled);
    if (!enabled.length) {
      setError("Enable at least one category with a full-cycle price");
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
                  ? "Create Package"
                  : mode === "edit"
                    ? `Edit: ${form.name || "Package"}`
                    : `View: ${form.name || "Package"}`}
              </h2>
              <p className="text-sm text-gray-500">
                {isViewOnly
                  ? "View-only mode"
                  : `Dynamic package with category-level pricing for the full ${form.billingCycle === "WEEKLY" ? "week" : "month"}`}
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
              {saving ? "Saving…" : "Save Package"}
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
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Package details</h3>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Package name</span>
              <input
                disabled={isViewOnly}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                placeholder="Family Meal Plan"
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
                <span className="mb-2 block text-xs text-gray-500">
                  Counted from midnight IST on the delivery date, not from the slot time. Example: 2 hours
                  for 18 Aug → cutoff 17 Aug, 10:00 PM IST.
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
                  <span className="block font-medium text-gray-700">
                    Show &quot;Most Popular&quot; label
                  </span>
                  <span className="block text-xs text-gray-500">
                    Highlights this plan on the user panel with a badge and accent border.
                  </span>
                </span>
              </label>
              {form.badge.trim().length > 0 && (
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Label text</span>
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
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                disabled={isViewOnly}
                checked={form.allowCustomerCategorySelection}
                onChange={(e) =>
                  setForm((f) => ({ ...f, allowCustomerCategorySelection: e.target.checked }))
                }
                className="mt-0.5"
              />
              <span>
                <span className="block font-medium text-gray-700">
                  Let customers choose categories at checkout
                </span>
                <span className="block text-xs text-gray-500">
                  When off, all enabled categories are included and customers cannot toggle them.
                </span>
              </span>
            </label>
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
                <span className="mb-2 block text-xs text-gray-500">
                  Hours before the delivery slot start time (IST). Example: 12 hours before an 8:30 PM
                  dinner slot → skip by 8:30 AM that day.
                </span>
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
            <div className="flex items-end justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Categories & pricing
              </h3>
              <p className="text-sm font-semibold text-gray-900">
                Catalogue sum: ₹{previewTotal.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
              <p className="font-semibold">Meals come from the live menu</p>
              <p className="mt-1 text-emerald-800/90">
                Customers see items from <strong>Menu Items</strong> and branch availability at
                customization time. Configure pricing and selection limits here — not individual dishes.
              </p>
            </div>
            <p className="text-xs text-gray-500">
              No package base price. Customers pay the sum of selected category prices for the full cycle.
            </p>

            {categoryDefinitions.map((def) => {
              const c = form.categories[def.id] ?? emptyCategory();
              return (
                <div key={def.id} className="rounded-2xl border border-gray-200 p-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <input
                      type="checkbox"
                      disabled={isViewOnly}
                      checked={c.enabled}
                      onChange={(e) => updateCategory(def.id, { enabled: e.target.checked })}
                    />
                    {def.name}
                  </label>

                  {c.enabled && (
                    <div className="mt-3 space-y-3">
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-700">{priceLabel}</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                          <input
                            disabled={isViewOnly}
                            type="number"
                            min={0}
                            value={c.categoryPrice}
                            onChange={(e) =>
                              updateCategory(def.id, { categoryPrice: Number(e.target.value) })
                            }
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-3"
                          />
                        </div>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-gray-700">Included qty / delivery</span>
                          <input
                            disabled={isViewOnly}
                            type="number"
                            min={0}
                            value={c.includedQuantityPerDelivery}
                            onChange={(e) =>
                              updateCategory(def.id, {
                                includedQuantityPerDelivery: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                          />
                        </label>
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-gray-700">Max qty / delivery</span>
                          <input
                            disabled={isViewOnly}
                            type="number"
                            min={1}
                            value={c.maximumQuantityPerDelivery}
                            onChange={(e) =>
                              updateCategory(def.id, {
                                maximumQuantityPerDelivery: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                          />
                        </label>
                      </div>

                      <label className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          disabled={isViewOnly}
                          checked={c.allowMultipleSelections}
                          onChange={(e) =>
                            updateCategory(def.id, {
                              allowMultipleSelections: e.target.checked,
                              maximumChoicesPerDelivery: e.target.checked
                                ? Math.max(c.maximumChoicesPerDelivery, 2)
                                : 1,
                            })
                          }
                          className="mt-0.5"
                        />
                        <span>
                          <span className="block font-medium text-gray-800">
                            Allow multiple item selections
                          </span>
                          <span className="block text-xs text-gray-500">
                            Off by default — customers pick one item in this category unless enabled.
                          </span>
                        </span>
                      </label>

                      {c.allowMultipleSelections && (
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-gray-700">
                            Max different items per delivery
                          </span>
                          <input
                            disabled={isViewOnly}
                            type="number"
                            min={2}
                            value={c.maximumChoicesPerDelivery}
                            onChange={(e) =>
                              updateCategory(def.id, {
                                maximumChoicesPerDelivery: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          {selected?.id ? (
            <MealSlotsPanel planId={selected.id} readOnly={isViewOnly} />
          ) : (
            <section className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4 text-sm text-violet-900">
              <p className="font-semibold">Meal slots & bundles</p>
              <p className="mt-1 text-violet-800/90">
                Save the package first, then reopen it to configure Lunch/Dinner slots and combo
                bundles for mobile checkout.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
