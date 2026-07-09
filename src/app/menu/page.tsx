"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Download, Upload, Search, UtensilsCrossed, Store, ShoppingCart, Layers, DollarSign, Loader2 } from "lucide-react";
import { useMenuStore } from "@/features/menu/hooks/useMenu";
import { HEALTH_TAG_CONFIG, HealthTag } from "@/features/menu/types/menu";
import { MenuTable } from "@/features/menu/components/MenuTable";
import { FoodDrawer } from "@/features/menu/components/FoodDrawer";
import { DeleteConfirmation } from "@/features/menu/components/DeleteConfirmation";
import { CategoryManager } from "@/features/menu/components/CategoryManager";

const statCards = [
  { key: "total", label: "Total Items", icon: UtensilsCrossed, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "available", label: "Available Today", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "outOfStock", label: "Out of Stock", icon: ShoppingCart, color: "text-red-600", bg: "bg-red-50" },
  { key: "categories", label: "Categories", icon: Layers, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "avgPrice", label: "Avg Price", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", prefix: "₹" },
];

export default function MenuPage() {
  const loadData = useMenuStore((s) => s.loadData);
  const loading = useMenuStore((s) => s.loading);
  const getStats = useMenuStore((s) => s.getStats);
  const stats = useMemo(() => getStats(), [getStats]);
  const filters = useMenuStore((s) => s.filters);
  const categories = useMenuStore((s) => s.categories);
  const setSearch = useMenuStore((s) => s.setSearch);
  const toggleCategoryFilter = useMenuStore((s) => s.toggleCategoryFilter);
  const toggleAvailabilityFilter = useMenuStore((s) => s.toggleAvailabilityFilter);
  const toggleHealthTagFilter = useMenuStore((s) => s.toggleHealthTagFilter);
  const clearFilters = useMenuStore((s) => s.clearFilters);
  const openAddDrawer = useMenuStore((s) => s.openAddDrawer);
  const openCategoryModal = useMenuStore((s) => s.openCategoryModal);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [showFilters, setShowFilters] = useState(false);
  const hasFilters = filters.category.length > 0 || filters.availability.length > 0 || filters.healthTags.length > 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Menu Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage all food items, pricing and availability.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openCategoryModal}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Layers className="h-4 w-4" />
              Categories
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={openAddDrawer}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Add Food Item
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-sm text-gray-500">Loading menu data...</span>
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            const value = stats[card.key as keyof typeof stats];
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {(card as { prefix?: string }).prefix || ""}{value}
                    </p>
                    <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or category..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                showFilters || hasFilters
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Filters
              {hasFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                  {filters.category.length + filters.availability.length + filters.healthTags.length}
                </span>
              )}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                Clear all
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-gray-200 bg-white p-5 space-y-5"
            >
              {/* Category */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = filters.category.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategoryFilter(cat.name)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                          active ? `border-current ${cat.bgColor} ${cat.color}` : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {cat.emoji} {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(["available", "unavailable", "out-of-stock"] as const).map((key) => {
                    const active = filters.availability.includes(key);
                    const labels = { available: "Available", unavailable: "Unavailable", "out-of-stock": "Out of Stock" };
                    return (
                      <button
                        key={key}
                        onClick={() => toggleAvailabilityFilter(key)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                          active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {labels[key]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Health Tags */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Health Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(HEALTH_TAG_CONFIG) as [HealthTag, { label: string; emoji: string }][]).map(([key, cfg]) => {
                    const active = filters.healthTags.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleHealthTagFilter(key)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                          active ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {cfg.emoji} {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <MenuTable />
        </motion.div>
      </div>

      {/* Drawer */}
      <FoodDrawer />

      {/* Delete Modal */}
      <DeleteConfirmation />

      {/* Category Manager */}
      <CategoryManager />
    </div>
  );
}
