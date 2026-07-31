"use client";

import { Pencil, Trash2, Eye } from "lucide-react";
import { ROTI_TYPE_LABELS } from "../types/subscription-menu";
import type { SubscriptionMenuItem } from "../types/subscription-menu";
import { useSubscriptionMenuStore } from "../hooks/useSubscriptionMenu";

export function SubscriptionMenuTable({ items }: { items: SubscriptionMenuItem[] }) {
  const openEditDrawer = useSubscriptionMenuStore((s) => s.openEditDrawer);
  const openViewDrawer = useSubscriptionMenuStore((s) => s.openViewDrawer);
  const removeItem = useSubscriptionMenuStore((s) => s.removeItem);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-sm text-gray-500">
        No subscription menu items yet. Add Jowar, Ragi, or Wheat rotis to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Roti Type</th>
            <th className="px-4 py-3">Kitchen Label</th>
            <th className="px-4 py-3">Default Qty</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/60">
              <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
              <td className="px-4 py-3">{ROTI_TYPE_LABELS[item.rotiType]}</td>
              <td className="px-4 py-3 text-gray-600">{item.kitchenLabel ?? "—"}</td>
              <td className="px-4 py-3">{item.defaultQty}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.active && item.subscriptionEnabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {item.active && item.subscriptionEnabled ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button onClick={() => openViewDrawer(item)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="View">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEditDrawer(item)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${item.name}?`)) void removeItem(item.id);
                    }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
