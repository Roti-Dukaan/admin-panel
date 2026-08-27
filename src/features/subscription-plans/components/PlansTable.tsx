"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
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
  Power,
  Trash2,
  UtensilsCrossed,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import {
  ACTIVE_STATUS_CONFIG,
  formatPlanDate,
  formatPlanPrice,
  PLAN_TYPE_LABELS,
  SubscriptionPlan,
} from "@/features/subscription-plans/types/subscription-plan";
import { useSubscriptionPlanStore } from "@/features/subscription-plans/hooks/useSubscriptionPlans";
import { TableActionsMenu } from "@/components/ui/table-actions-menu";

export function PlansTable({
  onEditPackage,
  onViewPackage,
  onConfigureMealSlots,
}: {
  onEditPackage?: (planId: string) => void;
  onViewPackage?: (planId: string) => void;
  onConfigureMealSlots?: (planId: string, planName: string) => void;
}) {
  const allPlans = useSubscriptionPlanStore((s) => s.plans);
  const loading = useSubscriptionPlanStore((s) => s.loading);
  const searchQuery = useSubscriptionPlanStore((s) => s.searchQuery);
  const statusFilter = useSubscriptionPlanStore((s) => s.statusFilter);
  const openViewEditor = useSubscriptionPlanStore((s) => s.openViewEditor);
  const openEditEditor = useSubscriptionPlanStore((s) => s.openEditEditor);
  const duplicatePlan = useSubscriptionPlanStore((s) => s.duplicatePlan);
  const toggleActive = useSubscriptionPlanStore((s) => s.toggleActive);
  const openDeleteModal = useSubscriptionPlanStore((s) => s.openDeleteModal);

  const plans = useMemo(() => {
    let filtered = [...allPlans];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.slug ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((p) => p.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((p) => !p.isActive);
    }

    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [allPlans, searchQuery, statusFilter]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<SubscriptionPlan>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Plan Name",
        cell: ({ row }) => {
          const plan = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 font-bold text-sm">
                {plan.name.charAt(0)}
              </div>
              <div>
                <span className="font-semibold text-gray-900">{plan.name}</span>
                {plan.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{plan.description}</p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const cfg = row.original.isActive
            ? ACTIVE_STATUS_CONFIG.active
            : ACTIVE_STATUS_CONFIG.inactive;
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
              {cfg.label}
            </span>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
            {PLAN_TYPE_LABELS[row.original.type]}
          </span>
        ),
      },
      {
        accessorKey: "finalPrice",
        header: "Final Price",
        cell: ({ row }) => {
          const plan = row.original;
          const hasDiscount = plan.isDiscountActive && plan.savingsAmount > 0;
          return (
            <div>
              {hasDiscount && (
                <span className="block text-xs text-gray-400 line-through">
                  {formatPlanPrice(plan.originalPrice ?? plan.price)}
                </span>
              )}
              <span className="text-sm font-semibold text-gray-900">
                {formatPlanPrice(plan.finalPrice ?? plan.price)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "skipLimitDisplay",
        header: "Skip Allowance",
        cell: ({ row }) => (
          <span className="text-xs text-gray-600">{row.original.skipLimitDisplay ?? "—"}</span>
        ),
      },
      {
        accessorKey: "deliveriesPerCycle",
        header: "Deliveries",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{row.original.deliveriesPerCycle}/cycle</span>
        ),
      },
      {
        accessorKey: "validityDays",
        header: "Validity",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{row.original.validityDays} days</span>
        ),
      },
      {
        accessorKey: "razorpayPlanId",
        header: "Razorpay Plan",
        cell: ({ row }) => {
          const id = row.original.razorpayPlanId;
          if (!id) {
            return <span className="text-xs text-gray-400">Not synced</span>;
          }
          return (
            <code
              className="max-w-[140px] truncate rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-700"
              title={id}
            >
              {id}
            </code>
          );
        },
      },
      {
        accessorKey: "displayOrder",
        header: "Order",
        cell: ({ row }) => (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
            {row.original.displayOrder}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{formatPlanDate(row.original.updatedAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const plan = row.original;
          return (
            <TableActionsMenu
              isOpen={openDropdown === plan.id}
              onClose={() => setOpenDropdown(null)}
              onToggle={() => setOpenDropdown(openDropdown === plan.id ? null : plan.id)}
              menuWidth={208}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  Actions
                </button>
              }
            >
              <button
                onClick={() => {
                  if (onViewPackage) onViewPackage(plan.id);
                  else openViewEditor(plan);
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 text-gray-400" /> View
              </button>
              <button
                onClick={() => {
                  if (onEditPackage) onEditPackage(plan.id);
                  else openEditEditor(plan);
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 text-gray-400" /> Edit Package
              </button>
              {onConfigureMealSlots && (
                <button
                  onClick={() => {
                    onConfigureMealSlots(plan.id, plan.name);
                    setOpenDropdown(null);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
                >
                  <UtensilsCrossed className="h-4 w-4 text-violet-500" /> Configure meal slots
                </button>
              )}
              <button
                onClick={() => {
                  duplicatePlan(plan);
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4 text-gray-400" /> Duplicate
              </button>
              <button
                onClick={() => {
                  toggleActive(plan.id, !plan.isActive);
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Power className="h-4 w-4 text-gray-400" />
                {plan.isActive ? "Deactivate" : "Activate"}
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => {
                  openDeleteModal(plan);
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </TableActionsMenu>
          );
        },
      },
    ],
    [openDropdown, openViewEditor, openEditEditor, onEditPackage, onViewPackage, onConfigureMealSlots, duplicatePlan, toggleActive, openDeleteModal]
  );

  const table = useReactTable({
    data: plans,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (loading && plans.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Loading subscription plans...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <CreditCard className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No Subscription Plans</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create your first subscription plan to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
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
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            plans.length
          )}{" "}
          of {plans.length} plans
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {table.getPageOptions().map((page) => (
            <button
              key={page}
              onClick={() => table.setPageIndex(page)}
              className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-medium transition-colors ${
                table.getState().pagination.pageIndex === page
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page + 1}
            </button>
          ))}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
