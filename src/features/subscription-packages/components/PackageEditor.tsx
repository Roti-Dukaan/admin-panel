"use client";

import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { ArrowLeft, Save } from "lucide-react";
import { subscriptionMenuApi } from "@/features/subscription-menu/services/subscription-menu.api";
import { subscriptionMenuCategoriesApi } from "@/features/subscription-menu/services/subscription-menu-categories.api";
import type { SubscriptionMenuItem } from "@/features/subscription-menu/types/subscription-menu";
import { packagesApi } from "../services/packages.api";
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
  menuItemIds: string[];
};

type PackageForm = {
  name: string;
  description: string;
  billingCycle: SubscriptionPlanType;
  validityDays: number;
  deliveriesPerCycle: number;
  active: boolean;
  displayOrder: number;
  selectionCutoffHours: number;
  categories: Record<string, CategoryForm>;
};

const emptyCategory = (): CategoryForm => ({
  enabled: false,
  categoryPrice: 0,
  includedQuantityPerDelivery: 1,
  maximumQuantityPerDelivery: 1,
  allowMultipleSelections: false,
  menuItemIds: [],
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
    };
  }
  return categories;
}

function emptyForm(definitions: MenuCategoryDefinition[] = []): PackageForm {
  return {
    name: "",
    description: "",
    billingCycle: "MONTHLY",
    validityDays: 30,
    deliveriesPerCycle: 30,
    active: true,
    displayOrder: 0,
    selectionCutoffHours: 24,
    categories: buildEmptyCategories(definitions),
  };
}

function packageToForm(pkg: SubscriptionPackage, definitions: MenuCategoryDefinition[]): PackageForm {
  const base = emptyForm(definitions);
  base.name = pkg.name;
  base.description = pkg.description ?? "";
  base.billingCycle = pkg.billingCycle ?? pkg.type;
  base.validityDays = pkg.validityDays;
  base.deliveriesPerCycle = pkg.deliveriesPerCycle;
  base.active = pkg.active ?? pkg.isActive;
  base.displayOrder = pkg.displayOrder;
  base.selectionCutoffHours = pkg.selectionCutoffHours ?? 24;

  for (const found of pkg.categories ?? []) {
    const key = found.categoryDefinitionId ?? found.categoryDefinition?.id;
    if (!key) continue;
    base.categories[key] = {
      enabled: found.active,
      categoryPrice: Number(found.categoryPrice),
      includedQuantityPerDelivery: found.includedQuantityPerDelivery,
      maximumQuantityPerDelivery: found.maximumQuantityPerDelivery,
      allowMultipleSelections:
        found.maximumChoicesPerDelivery == null || found.maximumChoicesPerDelivery > 1,
      menuItemIds: (found.menuItems ?? []).map((m) => m.menuItemId),
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
        ? Math.max(c.menuItemIds.length, 1)
        : 1,
      menuItemIds: c.enabled ? c.menuItemIds : [],
    }),
  );

  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    billingCycle: form.billingCycle,
    validityDays: Number(form.validityDays),
    deliveriesPerCycle: Number(form.deliveriesPerCycle),
    active: form.active,
    displayOrder: Number(form.displayOrder) || 0,
    selectionCutoffHours: Number(form.selectionCutoffHours) || 24,
    availableDeliveryDays: [],
    availableDeliverySlots: [],
    categories,
  };
}

function withDefaultMenuItems(
  form: PackageForm,
  definitions: MenuCategoryDefinition[],
  items: SubscriptionMenuItem[],
): PackageForm {
  const categories = { ...form.categories };
  for (const def of definitions) {
    const cat = categories[def.id];
    if (!cat?.enabled || cat.menuItemIds.length) continue;
    const ids = items
      .filter((m) => (m.categoryDefinitionId ?? m.categoryDefinition?.id) === def.id)
      .map((m) => m.id);
    if (ids.length) {
      categories[def.id] = { ...cat, menuItemIds: ids };
    }
  }
  return { ...form, categories };
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
  const [menuItems, setMenuItems] = useState<SubscriptionMenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isViewOnly = mode === "view";

  useEffect(() => {
    if (!open) return;
    setError(null);
    Promise.all([
      subscriptionMenuCategoriesApi.list(true),
      subscriptionMenuApi.list(true),
    ])
      .then(([defs, items]) => {
        setCategoryDefinitions(defs);
        setMenuItems(items);
        setForm(
          selected
            ? packageToForm(selected, defs)
            : withDefaultMenuItems(emptyForm(defs), defs, items),
        );
      })
      .catch(() => {
        setCategoryDefinitions([]);
        setMenuItems([]);
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

  const toggleMenuItem = (categoryDefinitionId: string, menuItemId: string) => {
    const current = form.categories[categoryDefinitionId]?.menuItemIds ?? [];
    const next = current.includes(menuItemId)
      ? current.filter((id) => id !== menuItemId)
      : [...current, menuItemId];
    updateCategory(categoryDefinitionId, { menuItemIds: next });
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
                {mode === "create" ? "Create Package" : mode === "edit" ? "Edit Package" : "View Package"}
              </h2>
              <p className="text-sm text-gray-500">
                Dynamic package with category-level pricing for the full {form.billingCycle === "WEEKLY" ? "week" : "month"}
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
              <textarea
                disabled={isViewOnly}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                rows={2}
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
                <span className="mb-1 block font-medium text-gray-700">Selection cutoff (hours before delivery)</span>
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
            <p className="text-xs text-gray-500">
              No package base price. Customers pay the sum of selected category prices for the full cycle.
              Menu items have no individual prices.
            </p>

            {categoryDefinitions.map((def) => {
              const c = form.categories[def.id] ?? emptyCategory();
              const itemsForCat = menuItems.filter(
                (m) => (m.categoryDefinitionId ?? m.categoryDefinition?.id) === def.id,
              );
              return (
                <div key={def.id} className="rounded-2xl border border-gray-200 p-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <input
                      type="checkbox"
                      disabled={isViewOnly}
                      checked={c.enabled}
                      onChange={(e) =>
                        updateCategory(def.id, {
                          enabled: e.target.checked,
                          ...(e.target.checked ? {} : { menuItemIds: [] }),
                        })
                      }
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
                            updateCategory(def.id, { allowMultipleSelections: e.target.checked })
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

                      <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">Allowed menu items</p>
                        {itemsForCat.length === 0 ? (
                          <p className="text-xs text-gray-500">
                            No menu items in this category yet. Add them under Subscription Menu.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {itemsForCat.map((item) => (
                              <label key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  disabled={isViewOnly}
                                  checked={c.menuItemIds.includes(item.id)}
                                  onChange={() => toggleMenuItem(def.id, item.id)}
                                />
                                {item.name}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
