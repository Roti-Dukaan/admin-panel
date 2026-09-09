"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ApiFoodItem } from "@/lib/types/api";

interface ProductCatalogPickerProps {
  products: ApiFoodItem[];
  selectedIds: string[];
  disabled?: boolean;
  error?: string;
  onChange: (ids: string[]) => void;
}

export function ProductCatalogPicker({
  products,
  selectedIds,
  disabled,
  error,
  onChange,
}: ProductCatalogPickerProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const toggleProduct = (productId: string) => {
    const ids = selectedIds.includes(productId)
      ? selectedIds.filter((id) => id !== productId)
      : [...selectedIds, productId];
    onChange(ids);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">Allowed Products</p>
      <p className="mb-2 text-xs text-gray-500">
        Products available for this meal option. Pick defaults per group in the meal schedule.
      </p>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product catalog..."
          className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm"
        />
      </div>
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-2">
        {filteredProducts.length === 0 ? (
          <p className="py-2 text-center text-xs text-gray-400">No products found</p>
        ) : (
          filteredProducts.map((product) => (
            <label
              key={product.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={selectedIds.includes(product.id)}
                onChange={() => toggleProduct(product.id)}
              />
              <span className="flex-1 text-sm text-gray-800">{product.name}</span>
              <span className="text-xs text-gray-500">₹{product.discountPrice ?? product.basePrice}</span>
            </label>
          ))
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
