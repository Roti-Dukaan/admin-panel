"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categoryApi } from "@/lib/api/category.api";
import type { ApiCategory } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onDone: (ids: string[], categories: ApiCategory[]) => void;
}

export function CategoryPickerDialog({ open, onOpenChange, selectedIds, onDone }: CategoryPickerDialogProps) {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (!open) return;
    setSelected(selectedIds);
    setLoading(true);
    categoryApi
      .list({ limit: 100, status: 'active', sort: 'displayOrder', order: 'asc' })
      .then((res) => setCategories(res.data?.items ?? []))
      .finally(() => setLoading(false));
  }, [open, selectedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Categories</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading categories...</p>
          ) : (
            filtered.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50">
                <input type="checkbox" checked={selected.includes(cat.id)} onChange={() => toggle(cat.id)} />
                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
              </label>
            ))
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setSelected(filtered.map((c) => c.id))}>Select All</Button>
            <Button type="button" variant="outline" onClick={() => setSelected([])}>Clear</Button>
          </div>
          <Button
            type="button"
            onClick={() => {
              const picked = categories
                .filter((c) => selected.includes(c.id))
                .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
              onDone(
                picked.map((c) => c.id),
                picked,
              );
              onOpenChange(false);
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
