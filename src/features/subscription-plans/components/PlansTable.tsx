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
  Archive,
  Trash2,
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { SubscriptionPlan, STATUS_CONFIG } from "@/features/subscription-plans/types/subscription-plan";
import { useSubscriptionPlanStore } from "@/features/subscription-plans/hooks/useSubscriptionPlans";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDeliveryDayLabel(days: string[]): string {
  if (days.length === 7) return "Everyday";
  if (days.length === 5 && !days.includes("saturday") && !days.includes("sunday"))
    return "Weekdays";
  if (days.length === 2 && days.includes("saturday") && days.includes("sunday"))
    return "Weekends";
  if (days.length <= 2) return days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ");
  return `${days.length} days/week`;
}

export function PlansTable() {
  const allPlans = useSubscriptionPlanStore((s) => s.plans);
  const searchQuery = useSubscriptionPlanStore((s) => s.searchQuery);
  const statusFilter = useSubscriptionPlanStore((s) => s.statusFilter);
  const openViewEditor = useSubscriptionPlanStore((s) => s.openViewEditor);
  const openEditEditor = useSubscriptionPlanStore((s) => s.openEditEditor);
  const duplicatePlan = useSubscriptionPlanStore((s) => s.duplicatePlan);
  const archivePlan = useSubscriptionPlanStore((s) => s.archivePlan);
  const openDeleteModal = useSubscriptionPlanStore((s) => s.openDeleteModal);
  const toggleFeatured = useSubscriptionPlanStore((s) => s.toggleFeatured);

  const plans = useMemo(() => {
    let filtered = [...allPlans];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.planBadge.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
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
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{plan.name}</span>
                  {plan.isFeatured && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  )}
                </div>
                {plan.planBadge && (
                  <span className="inline-block mt-0.5 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                    {plan.planBadge}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const cfg = STATUS_CONFIG[status];
          return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
              {cfg.label}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.pricing.monthlyPrice,
        id: "billingCycle",
        header: "Billing Cycle",
        cell: ({ row }) => {
          const p = row.original.pricing;
          return (
            <div className="text-sm">
              <span className="font-medium text-gray-900">{formatCurrency(p.monthlyPrice)}</span>
              <span className="text-gray-400">/mo</span>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.meals.dailyMealCount,
        id: "mealsPerDay",
        header: "Meals/Day",
        cell: ({ row }) => (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
            {row.original.meals.dailyMealCount}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.delivery.deliveryDays,
        id: "deliverySchedule",
        header: "Delivery",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {getDeliveryDayLabel(row.original.delivery.deliveryDays)}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.pricing.weeklyPrice,
        id: "price",
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        sortingFn: "basic",
        cell: ({ row }) => {
          const p = row.original.pricing;
          return (
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{formatCurrency(p.weeklyPrice)}</span>
              <span className="text-gray-400">/wk</span>
            </div>
          );
        },
      },
      {
        accessorKey: "subscribers",
        header: "Subscribers",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            {row.original.subscribers}
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{formatDate(row.original.updatedAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const plan = row.original;
          return (
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === plan.id ? null : plan.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
                Actions
              </button>
              {openDropdown === plan.id && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg"
                  >
                    <button
                      onClick={() => { openViewEditor(plan); setOpenDropdown(null); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 text-gray-400" /> View
                    </button>
                    <button
                      onClick={() => { openEditEditor(plan); setOpenDropdown(null); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4 text-gray-400" /> Edit
                    </button>
                    <button
                      onClick={() => { duplicatePlan(plan); setOpenDropdown(null); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4 text-gray-400" /> Duplicate
                    </button>
                    <button
                      onClick={() => { toggleFeatured(plan.id); setOpenDropdown(null); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Star className={`h-4 w-4 ${plan.isFeatured ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
                      {plan.isFeatured ? "Unfeature" : "Feature"}
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={() => { archivePlan(plan.id); setOpenDropdown(null); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Archive className="h-4 w-4 text-gray-400" /> Archive
                    </button>
                    <button
                      onClick={() => { openDeleteModal(plan); setOpenDropdown(null); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
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
    [
      openDropdown,
      openViewEditor,
      openEditEditor,
      duplicatePlan,
      archivePlan,
      openDeleteModal,
      toggleFeatured,
    ]
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

      {/* Pagination */}
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

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  );
}
