"use client";

import { Plus, Star, Trash2 } from "lucide-react";
import type { FoodItemVariant } from "../types/menu";

function emptyVariant(sortOrder: number): FoodItemVariant {
  return {
    name: "",
    price: 0,
    isDefault: sortOrder === 0,
    isAvailable: true,
    sortOrder,
  };
}

interface FoodVariantsEditorProps {
  variants: FoodItemVariant[];
  onChange: (variants: FoodItemVariant[]) => void;
  disabled?: boolean;
}

export function FoodVariantsEditor({ variants, onChange, disabled }: FoodVariantsEditorProps) {
  const enabled = variants.length > 0;

  const setDefault = (index: number) => {
    onChange(
      variants.map((variant, i) => ({
        ...variant,
        isDefault: i === index,
      })),
    );
  };

  const updateVariant = (index: number, patch: Partial<FoodItemVariant>) => {
    onChange(
      variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    );
  };

  const removeVariant = (index: number) => {
    const next = variants.filter((_, i) => i !== index).map((variant, i) => ({
      ...variant,
      sortOrder: i,
      isDefault: variant.isDefault,
    }));
    if (next.length > 0 && !next.some((variant) => variant.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    onChange(next);
  };

  const addVariant = () => {
    onChange([...variants, emptyVariant(variants.length)]);
  };

  const enableVariants = () => {
    onChange([
      emptyVariant(0),
      { ...emptyVariant(1), isDefault: false, name: "", price: 0 },
    ]);
  };

  const disableVariants = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          Add size or portion options (e.g. Half, Full, Family pack). Customers will pick one when ordering.
        </p>
        {!disabled && (
          <button
            type="button"
            onClick={enabled ? disableVariants : enableVariants}
            className="text-xs font-medium text-gray-700 underline-offset-2 hover:underline"
          >
            {enabled ? "Use single price instead" : "Add variants"}
          </button>
        )}
      </div>

      {enabled && (
        <div className="space-y-2">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `variant-${index}`}
              className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-gray-50/80 p-3 md:grid-cols-[1fr_120px_auto_auto]"
            >
              <input
                type="text"
                value={variant.name}
                disabled={disabled}
                onChange={(e) => updateVariant(index, { name: e.target.value })}
                placeholder="Variant name (e.g. Full)"
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:bg-gray-100"
              />
              <input
                type="number"
                min={0}
                step="any"
                value={Number.isFinite(variant.price) ? variant.price : 0}
                disabled={disabled}
                onChange={(e) => updateVariant(index, { price: Number(e.target.value) || 0 })}
                placeholder="Price"
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:bg-gray-100"
              />
              <button
                type="button"
                disabled={disabled || variant.isDefault}
                onClick={() => setDefault(index)}
                className={`inline-flex h-10 items-center justify-center gap-1 rounded-lg border px-3 text-xs font-medium ${
                  variant.isDefault
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                } disabled:cursor-default`}
                title="Default variant shown first"
              >
                <Star className={`h-3.5 w-3.5 ${variant.isDefault ? "fill-amber-500 text-amber-500" : ""}`} />
                Default
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeVariant(index)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label="Remove variant"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {!disabled && (
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add variant
            </button>
          )}
        </div>
      )}
    </div>
  );
}
