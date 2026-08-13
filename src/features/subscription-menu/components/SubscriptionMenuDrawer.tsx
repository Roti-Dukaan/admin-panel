"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  EMPTY_MENU_ITEM,
  ROTI_TYPE_LABELS,
  type RotiType,
  type SubscriptionMenuItem,
  type SubscriptionMenuItemForm,
} from "../types/subscription-menu";
import { useSubscriptionMenuStore } from "../hooks/useSubscriptionMenu";
import {
  subscriptionMenuCategoriesApi,
  type MenuCategoryDefinition,
} from "../services/subscription-menu-categories.api";

function itemToForm(item: SubscriptionMenuItem): SubscriptionMenuItemForm {
  return {
    name: item.name,
    slug: item.slug,
    category: item.category,
    categoryDefinitionId: item.categoryDefinitionId ?? item.categoryDefinition?.id ?? "",
    rotiType: item.rotiType,
    description: item.description ?? "",
    image: item.image ?? "",
    active: item.active,
    subscriptionEnabled: item.subscriptionEnabled,
    defaultQty: item.defaultQty,
    sortOrder: item.sortOrder,
    kitchenLabel: item.kitchenLabel ?? "",
  };
}

export function SubscriptionMenuDrawer() {
  const drawerOpen = useSubscriptionMenuStore((s) => s.drawerOpen);
  const drawerMode = useSubscriptionMenuStore((s) => s.drawerMode);
  const selectedItem = useSubscriptionMenuStore((s) => s.selectedItem);
  const closeDrawer = useSubscriptionMenuStore((s) => s.closeDrawer);
  const addItem = useSubscriptionMenuStore((s) => s.addItem);
  const updateItem = useSubscriptionMenuStore((s) => s.updateItem);

  const isViewOnly = drawerMode === "view";
  const [form, setForm] = useState<SubscriptionMenuItemForm>(EMPTY_MENU_ITEM);
  const [categories, setCategories] = useState<MenuCategoryDefinition[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      void subscriptionMenuCategoriesApi.list(true).then(setCategories);
      setForm(selectedItem ? itemToForm(selectedItem) : EMPTY_MENU_ITEM);
    }
  }, [drawerOpen, selectedItem]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryDefinitionId),
    [categories, form.categoryDefinitionId],
  );

  const showRotiType = selectedCategory?.requiresRotiType ?? false;

  const inputClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50";

  const handleSave = async () => {
    if (!form.name.trim() || !form.categoryDefinitionId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug?.trim() || undefined,
        categoryDefinitionId: form.categoryDefinitionId,
        kitchenLabel: form.kitchenLabel?.trim() || form.name.trim(),
      };
      if (drawerMode === "add") await addItem(payload);
      else if (drawerMode === "edit" && selectedItem) await updateItem(selectedItem.id, payload);
      closeDrawer();
    } finally {
      setSaving(false);
    }
  };

  if (!drawerOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeDrawer} />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={closeDrawer} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold">
                {drawerMode === "add" ? "Add Menu Item" : selectedItem?.name}
              </h2>
            </div>
            {!isViewOnly && (
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.categoryDefinitionId}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <Field label="Category">
              <select
                className={inputClass}
                value={form.categoryDefinitionId ?? ""}
                disabled={isViewOnly}
                onChange={(e) => setForm({ ...form, categoryDefinitionId: e.target.value })}
              >
                <option value="">Select category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Name">
              <input className={inputClass} value={form.name} disabled={isViewOnly} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Slug">
              <input className={inputClass} value={form.slug ?? ""} disabled={isViewOnly} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            {showRotiType && (
              <Field label="Roti Type">
                <select
                  className={inputClass}
                  value={form.rotiType}
                  disabled={isViewOnly}
                  onChange={(e) => setForm({ ...form, rotiType: e.target.value as RotiType })}
                >
                  {(Object.keys(ROTI_TYPE_LABELS) as RotiType[]).map((t) => (
                    <option key={t} value={t}>{ROTI_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Kitchen Label">
              <input className={inputClass} value={form.kitchenLabel ?? ""} disabled={isViewOnly} onChange={(e) => setForm({ ...form, kitchenLabel: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className={`${inputClass} h-auto py-3`} rows={3} value={form.description ?? ""} disabled={isViewOnly} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default Qty">
                <input type="number" min={1} className={inputClass} value={form.defaultQty} disabled={isViewOnly} onChange={(e) => setForm({ ...form, defaultQty: parseInt(e.target.value, 10) || 1 })} />
              </Field>
              <Field label="Sort Order">
                <input type="number" className={inputClass} value={form.sortOrder} disabled={isViewOnly} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} disabled={isViewOnly} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.subscriptionEnabled} disabled={isViewOnly} onChange={(e) => setForm({ ...form, subscriptionEnabled: e.target.checked })} />
              Available for subscription checkout
            </label>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-900">{label}</label>
      {children}
    </div>
  );
}
