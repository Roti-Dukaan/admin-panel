"use client";

import { Search } from "lucide-react";
import { useKitchenStore } from "../hooks/useKitchen";

export function SearchBar() {
  const search = useKitchenStore((s) => s.filters.search);
  const setSearch = useKitchenStore((s) => s.setSearch);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search order or customer..."
        className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
      />
    </div>
  );
}
