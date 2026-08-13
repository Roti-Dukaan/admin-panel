"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  subscriptionMenuCategoriesApi,
  type MenuCategoryDefinition,
} from "../services/subscription-menu-categories.api";

interface MenuCategoryManagerProps {
  onCategoriesChange?: (categories: MenuCategoryDefinition[]) => void;
}

export function MenuCategoryManager({ onCategoriesChange }: MenuCategoryManagerProps) {
  const [categories, setCategories] = useState<MenuCategoryDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [requiresRotiType, setRequiresRotiType] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await subscriptionMenuCategoriesApi.list();
      setCategories(data);
      onCategoriesChange?.(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await subscriptionMenuCategoriesApi.create({
        name: name.trim(),
        requiresRotiType,
      });
      setName("");
      setRequiresRotiType(false);
      toast.success("Category created");
      await load();
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat: MenuCategoryDefinition) => {
    try {
      await subscriptionMenuCategoriesApi.update(cat.id, { active: !cat.active });
      await load();
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (cat: MenuCategoryDefinition) => {
    if (!confirm(`Remove category "${cat.name}"?`)) return;
    try {
      await subscriptionMenuCategoriesApi.remove(cat.id);
      toast.success("Category removed");
      await load();
    } catch {
      toast.error("Failed to remove category");
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
            Menu Categories
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Create categories like Rotis, Curries, or Add-ons. Items and packages use these categories.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm">
          <span className="mb-1 block font-medium text-gray-700">Category name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Beverages"
            className="h-11 w-full rounded-xl border border-gray-200 px-4"
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={requiresRotiType}
            onChange={(e) => setRequiresRotiType(e.target.checked)}
          />
          Requires roti type
        </label>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={saving || !name.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading categories…
        </div>
      ) : categories.length === 0 ? (
        <p className="py-4 text-sm text-gray-500">No categories yet. Create your first category above.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
            >
              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-500">
                  slug: {cat.slug}
                  {cat.requiresRotiType ? " · roti type required" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void toggleActive(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    cat.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {cat.active ? "Active" : "Inactive"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(cat)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
