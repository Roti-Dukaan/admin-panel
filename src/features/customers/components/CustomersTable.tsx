"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { useCustomerStore } from "../hooks/useCustomers";
import { Customer, SUBSCRIPTION_PLAN_CONFIG } from "../types/customer";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getStatusBadge(status: string) {
  if (status === "active") return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span>;
  return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">Inactive</span>;
}

function getSubscriberBadge(isSubscriber: boolean) {
  if (!isSubscriber) return <span className="text-xs text-gray-400">—</span>;
  return <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Subscriber</span>;
}

function getVipBadge(isVip: boolean) {
  if (!isVip) return null;
  return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">VIP</span>;
}

export function CustomersTable() {
  const getFilteredCustomers = useCustomerStore((s) => s.getFilteredCustomers);
  const setSelectedCustomer = useCustomerStore((s) => s.setSelectedCustomer);
  const customers = useMemo(() => getFilteredCustomers(), [getFilteredCustomers]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer
            {column.getIsSorted() === "asc" ? <ArrowUp className="h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">
                {getInitials(c.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-500 truncate">{c.phone}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</span>,
        cell: ({ getValue }) => getStatusBadge(getValue() as string),
      },
      {
        accessorKey: "isSubscriber",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Subscription</span>,
        cell: ({ row }) => {
          const c = row.original;
          if (c.subscription) {
            const cfg = SUBSCRIPTION_PLAN_CONFIG[c.subscription.plan];
            return (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color} ${cfg.bgColor}`}>
                  {cfg.label}
                </span>
              </div>
            );
          }
          return getSubscriberBadge(c.isSubscriber);
        },
      },
      {
        id: "orders",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Orders</span>,
        cell: ({ row }) => {
          const c = row.original;
          const totalSpent = c.orders.reduce((s, o) => s + o.amount, 0);
          return (
            <div>
              <p className="text-sm font-semibold text-gray-900">{c.orders.length}</p>
              <p className="text-xs text-gray-500">₹{totalSpent.toLocaleString("en-IN")}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "lastLogin",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Active
            {column.getIsSorted() === "asc" ? <ArrowUp className="h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600">{formatDate(getValue() as number)}</span>
        ),
      },
      {
        id: "vip",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">VIP</span>,
        cell: ({ row }) => getVipBadge(row.original.isVip),
      },
      {
        id: "actions",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</span>,
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedCustomer(row.original)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
        ),
      },
    ],
    [setSelectedCustomer]
  );

  const table = useReactTable({
    data: customers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/50">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-500">
                  No customers found matching your filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCustomer(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {customers.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/30 px-4 py-2.5">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{customers.length}</span> customer{customers.length !== 1 && "s"}
          </p>
        </div>
      )}
    </div>
  );
}
