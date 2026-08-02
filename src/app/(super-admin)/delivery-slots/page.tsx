"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  GripVertical,
} from "lucide-react";
import { deliverySlotsApi, DeliverySlot as ApiDeliverySlot } from "@/lib/api/delivery-slots.api";
import { formatDeliverySlotLabel } from "@/lib/delivery-slot-display";
import { DeliverySlotTimeInput } from "@/components/delivery/DeliverySlotTimeInput";
import { Header } from "@/components/layout/header";
import { TableActionsMenu } from "@/components/ui/table-actions-menu";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DeliverySlot {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  cutoffMinutes: number;
  maxOrders: number;
  displayOrder: number;
  isActive: boolean;
  isAcceptingOrders: boolean;
  createdAt: string;
  updatedAt: string;
}

type DrawerMode = "add" | "edit" | "view";

const EMPTY_SLOT: Omit<DeliverySlot, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  startTime: "",
  endTime: "",
  cutoffMinutes: 30,
  maxOrders: 50,
  displayOrder: 0,
  isActive: true,
  isAcceptingOrders: true,
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DeliverySlotsPage() {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [editing, setEditing] = useState(EMPTY_SLOT);
  const [deleteTarget, setDeleteTarget] = useState<DeliverySlot | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliverySlotsApi.list();
      setSlots(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load delivery slots");
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return slots;
    const q = search.toLowerCase();
    return slots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [slots, search]);

  /* ---- open helpers ---- */

  const openAdd = () => {
    const maxOrder = slots.reduce((max, s) => Math.max(max, s.displayOrder), 0);
    setEditing({ ...EMPTY_SLOT, displayOrder: maxOrder + 1 });
    setDrawerMode("add");
    setSelectedSlot(null);
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (slot: DeliverySlot) => {
    setEditing({
      name: slot.name,
      description: slot.description,
      startTime: slot.startTime,
      endTime: slot.endTime,
      cutoffMinutes: slot.cutoffMinutes,
      maxOrders: slot.maxOrders,
      displayOrder: slot.displayOrder,
      isActive: slot.isActive,
      isAcceptingOrders: slot.isAcceptingOrders,
    });
    setDrawerMode("edit");
    setSelectedSlot(slot);
    setErrors({});
    setDrawerOpen(true);
    setMenuOpen(null);
  };

  const openView = (slot: DeliverySlot) => {
    setEditing({
      name: slot.name,
      description: slot.description,
      startTime: slot.startTime,
      endTime: slot.endTime,
      cutoffMinutes: slot.cutoffMinutes,
      maxOrders: slot.maxOrders,
      displayOrder: slot.displayOrder,
      isActive: slot.isActive,
      isAcceptingOrders: slot.isAcceptingOrders,
    });
    setDrawerMode("view");
    setSelectedSlot(slot);
    setErrors({});
    setDrawerOpen(true);
    setMenuOpen(null);
  };

  const duplicateSlot = (slot: DeliverySlot) => {
    setEditing({
      name: `${slot.name} (Copy)`,
      description: slot.description,
      startTime: slot.startTime,
      endTime: slot.endTime,
      cutoffMinutes: slot.cutoffMinutes,
      maxOrders: slot.maxOrders,
      displayOrder: slots.length + 1,
      isActive: false,
      isAcceptingOrders: false,
    });
    setDrawerMode("add");
    setSelectedSlot(null);
    setErrors({});
    setDrawerOpen(true);
    setMenuOpen(null);
  };

  /* ---- save ---- */

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!editing.name.trim()) e.name = "Name is required";
    if (!editing.startTime) e.startTime = "Start time is required";
    if (!editing.endTime) e.endTime = "End time is required";
    if (editing.startTime && editing.endTime && editing.startTime >= editing.endTime)
      e.endTime = "End time must be after start time";
    if (editing.maxOrders < 1) e.maxOrders = "Max orders must be at least 1";
    if (editing.cutoffMinutes < 0) e.cutoffMinutes = "Cutoff cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (drawerMode === "edit" && selectedSlot) {
        const updated = await deliverySlotsApi.update(selectedSlot.id, editing);
        setSlots((prev) =>
          prev.map((s) => (s.id === selectedSlot.id ? updated : s))
        );
      } else {
        const created = await deliverySlotsApi.create({
          ...editing,
          displayOrder: editing.displayOrder || slots.length + 1,
        });
        setSlots((prev) => [...prev, created]);
      }
      setDrawerOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save delivery slot");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deliverySlotsApi.remove(deleteTarget.id);
      setSlots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete delivery slot");
    }
  };

  const toggleStatus = async (slot: DeliverySlot) => {
    try {
      const updated = await deliverySlotsApi.update(slot.id, {
        isActive: !slot.isActive,
      });
      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? updated : s))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  /* ---- stats ---- */

  const stats = useMemo(
    () => ({
      total: slots.length,
      active: slots.filter((s) => s.isActive).length,
      accepting: slots.filter((s) => s.isAcceptingOrders).length,
      totalCapacity: slots.reduce((sum, s) => sum + s.maxOrders, 0),
    }),
    [slots]
  );

  /* ---- validation badge class ---- */
  const inputCls = (field: string) =>
    `h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 ${
      errors[field] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Delivery Slots"
        subtitle="Manage delivery time slots for customer orders."
        actions={
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Slot
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        {slots.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Slots", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Active", value: stats.active, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Accepting Orders", value: stats.accepting, color: "text-violet-600", bg: "bg-violet-50" },
              { label: "Total Capacity", value: stats.totalCapacity, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
                    <Clock className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                    <p className="text-xs font-medium text-gray-500">{c.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {/* Table or Empty */}
        {loading ? (
           <div className="flex justify-center items-center py-20">
             <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
           </div>
         ) : error ? (
           <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
             <p className="text-red-600 font-medium">{error}</p>
             <button
               onClick={loadSlots}
               className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
             >
               Retry
             </button>
           </div>
         ) : slots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-dashed border-gray-300 bg-white p-12"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No delivery slots yet</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Create delivery time slots to let customers choose when they want their order delivered.
              </p>
              <button
                onClick={openAdd}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                Create First Slot
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Slot</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Cutoff</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Max Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <GripVertical className="h-4 w-4" />
                        <span className="font-mono text-xs">{slot.displayOrder}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{slot.name}</p>
                        {slot.description && (
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{slot.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {formatDeliverySlotLabel(slot.startTime, slot.endTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{slot.cutoffMinutes} min</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{slot.maxOrders}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(slot)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                            slot.isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {slot.isActive ? (
                            <><CheckCircle2 className="h-3 w-3" /> Active</>
                          ) : (
                            <><XCircle className="h-3 w-3" /> Inactive</>
                          )}
                        </button>
                        {!slot.isAcceptingOrders && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            PAUSED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TableActionsMenu
                        isOpen={menuOpen === slot.id}
                        onClose={() => setMenuOpen(null)}
                        onToggle={() => setMenuOpen(menuOpen === slot.id ? null : slot.id)}
                        menuWidth={160}
                        trigger={
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        }
                      >
                        <button onClick={() => openView(slot)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> View
                        </button>
                        <button onClick={() => openEdit(slot)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => duplicateSlot(slot)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Copy className="h-4 w-4" /> Duplicate
                        </button>
                        <div className="my-1 border-t border-gray-100" />
                        <button onClick={() => { setDeleteTarget(slot); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </TableActionsMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-xl border-l border-gray-200 bg-white shadow-2xl"
            >
              <div className="flex h-full flex-col">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {drawerMode === "add" && "Add Delivery Slot"}
                      {drawerMode === "edit" && "Edit Delivery Slot"}
                      {drawerMode === "view" && "View Delivery Slot"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {drawerMode === "view" ? "View-only mode" : "Configure delivery slot details"}
                    </p>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-500">Name *</label>
                    <input
                      value={editing.name}
                      onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                      disabled={drawerMode === "view"}
                      className={inputCls("name")}
                      placeholder="e.g. Lunch Delivery"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-500">Description</label>
                    <textarea
                      value={editing.description}
                      onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                      disabled={drawerMode === "view"}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none disabled:opacity-60"
                      placeholder="Describe this delivery slot..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-500">Start Time *</label>
                      <DeliverySlotTimeInput
                        value={editing.startTime}
                        onChange={(startTime) => setEditing((p) => ({ ...p, startTime }))}
                        disabled={drawerMode === "view"}
                      />
                      {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-500">End Time *</label>
                      <DeliverySlotTimeInput
                        value={editing.endTime}
                        onChange={(endTime) => setEditing((p) => ({ ...p, endTime }))}
                        disabled={drawerMode === "view"}
                      />
                      {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-500">Order Cutoff (min)</label>
                      <input
                        type="number"
                        value={editing.cutoffMinutes}
                        onChange={(e) => setEditing((p) => ({ ...p, cutoffMinutes: Number(e.target.value) }))}
                        disabled={drawerMode === "view"}
                        min={0}
                        className={inputCls("cutoffMinutes")}
                      />
                      {errors.cutoffMinutes && <p className="mt-1 text-xs text-red-500">{errors.cutoffMinutes}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-500">Max Orders *</label>
                      <input
                        type="number"
                        value={editing.maxOrders}
                        onChange={(e) => setEditing((p) => ({ ...p, maxOrders: Number(e.target.value) }))}
                        disabled={drawerMode === "view"}
                        min={1}
                        className={inputCls("maxOrders")}
                      />
                      {errors.maxOrders && <p className="mt-1 text-xs text-red-500">{errors.maxOrders}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-500">Display Order</label>
                    <input
                      type="number"
                      value={editing.displayOrder}
                      onChange={(e) => setEditing((p) => ({ ...p, displayOrder: Number(e.target.value) }))}
                      disabled={drawerMode === "view"}
                      min={0}
                      className={inputCls("displayOrder")}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.isActive}
                        onChange={(e) => setEditing((p) => ({ ...p, isActive: e.target.checked }))}
                        disabled={drawerMode === "view"}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.isAcceptingOrders}
                        onChange={(e) => setEditing((p) => ({ ...p, isAcceptingOrders: e.target.checked }))}
                        disabled={drawerMode === "view"}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Accepting Orders</span>
                    </label>
                  </div>
                </div>

                {/* Drawer Footer */}
                {drawerMode !== "view" && (
                  <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
                    >
                      {drawerMode === "add" ? "Create Slot" : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Delivery Slot</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
