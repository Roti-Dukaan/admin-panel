"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { foodItemApi } from "@/lib/api/food.api";
import type { ApiFoodItem } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onDone: (ids: string[], products: ApiFoodItem[]) => void;
}

export function ProductPickerDialog({ open, onOpenChange, selectedIds, onDone }: ProductPickerDialogProps) {
  const [items, setItems] = useState<ApiFoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (!open) return;
    setSelected(selectedIds);
    setLoading(true);
    foodItemApi
      .list({ limit: 200, isAvailable: true })
      .then((res) => setItems(res.data?.items ?? []))
      .finally(() => setLoading(false));
  }, [open, selectedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading products...</p>
          ) : (
            filtered.map((item) => (
              <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50">
                <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
                <span className="flex-1 text-sm font-medium text-gray-800">{item.name}</span>
                <span className="text-sm text-gray-500">₹{item.discountPrice ?? item.basePrice}</span>
              </label>
            ))
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setSelected(filtered.map((i) => i.id))}>Select All</Button>
            <Button type="button" variant="outline" onClick={() => setSelected([])}>Clear</Button>
          </div>
          <Button
            type="button"
            onClick={() => {
              const picked = items.filter((i) => selected.includes(i.id));
              onDone(selected, picked);
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
