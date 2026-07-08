"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { DeliverySlotConfig, STATUS_CONFIG, MEAL_TYPE_CONFIG } from "@/features/delivery-slots/types/delivery-slot";
import { useDeliverySlotStore } from "@/features/delivery-slots/hooks/useDeliverySlots";

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function SlotsTable() {
  const allSlots = useDeliverySlotStore((s) => s.slots);
  const searchQuery = useDeliverySlotStore((s) => s.searchQuery);
  const statusFilter = useDeliverySlotStore((s) => s.statusFilter);
  const mealFilter = useDeliverySlotStore((s) => s.mealFilter);
  const openViewDrawer = useDeliverySlotStore((s) => s.openViewDrawer);
  const openEditDrawer = useDeliverySlotStore((s) => s.openEditDrawer);
  const duplicateSlot = useDeliverySlotStore((s) => s.duplicateSlot);
  const openDeleteModal = useDeliverySlotStore((s) => s.openDeleteModal);
  const toggleStatus = useDeliverySlotStore((s) => s.toggleStatus);

  const slots = useMemo(() => {
    let filtered = [...allSlots];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter((s) => s.status === statusFilter);
    if (mealFilter !== "all") filtered = filtered.filter((s) => s.mealType === mealFilter);
    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [allSlots, searchQuery, statusFilter, mealFilter]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<DeliverySlotConfig>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Slot Name",
        cell: ({ row }) => {
          const slot = row.original;
          const meal = MEAL_TYPE_CONFIG[slot.mealType];
          return (
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${meal.bgColor}`}>
                {meal.emoji}
              </div>
              <div>
                <span className="font-semibold text-gray-900">{slot.displayName}</span>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{slot.description}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "time",
        header: "Time",
        cell: ({ row }) => (
          <div className="text-sm">
            <span className="font-medium text-gray-900">{formatTime(row.original.startTime)}</span>
            <span className="text-gray-400"> – </span>
            <span className="font-medium text-gray-900">{formatTime(row.original.endTime)}</span>
          </div>
        ),
      },
      {
        accessorKey: "mealType",
        header: "Meal Type",
        cell: ({ row }) => {
          const cfg = MEAL_TYPE_CONFIG[row.original.mealType];
          return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
          );
        },
      },
      {
        id: "capacity",
        header: "Capacity",
        cell: ({ row }) => {
          const s = row.original;
          const pct = s.maxOrders > 0 ? Math.round((s.currentBookings / s.maxOrders) * 100) : 0;
          const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
          return (
            <div className="min-w-[120px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{s.currentBookings}/{s.maxOrders}</span>
                <span className="text-gray-400">{pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        id: "bookings",
        header: "Bookings",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-700">{row.original.todayBookings}</span>
        ),
      },
      {
        id: "cutoff",
        header: "Cut-off",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{formatTime(row.original.cutoffTime)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const cfg = STATUS_CONFIG[row.original.status];
          return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
              {cfg.label}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const slot = row.original;
          return (
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === slot.id ? null : slot.id)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {openDropdown === slot.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg"
                  >
                    <button onClick={() => { openViewDrawer(slot); setOpenDropdown(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Eye className="h-4 w-4 text-gray-400" /> View
                    </button>
                    <button onClick={() => { openEditDrawer(slot); setOpenDropdown(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Pencil className="h-4 w-4 text-gray-400" /> Edit
                    </button>
                    <button onClick={() => { duplicateSlot(slot); setOpenDropdown(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Copy className="h-4 w-4 text-gray-400" /> Duplicate
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    {slot.status !== "active" && (
                      <button onClick={() => { toggleStatus(slot.id, "active"); setOpenDropdown(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50">
                        Activate
                      </button>
                    )}
                    {slot.status === "active" && (
                      <button onClick={() => { toggleStatus(slot.id, "disabled"); setOpenDropdown(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50">
                        Disable
                      </button>
                    )}
                    <button onClick={() => { openDeleteModal(slot); setOpenDropdown(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [openDropdown, openViewDrawer, openEditDrawer, duplicateSlot, openDeleteModal, toggleStatus]
  );

  const table = useReactTable({
    data: slots,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No Delivery Slots Configured</h3>
        <p className="mt-1 text-sm text-gray-500">Create your first delivery slot to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-100 bg-gray-50/50">
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <p className="text-sm text-gray-500">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, slots.length)} of {slots.length} slots
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {table.getPageOptions().map((page) => (
            <button key={page} onClick={() => table.setPageIndex(page)} className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-medium transition-colors ${table.getState().pagination.pageIndex === page ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {page + 1}
            </button>
          ))}
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
