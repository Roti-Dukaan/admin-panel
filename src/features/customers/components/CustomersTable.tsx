"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useCustomerStore } from "../hooks/useCustomers";
import { Customer } from "../types/customer";
import { useWorkspace } from "@/contexts/WorkspaceContext";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getStatusBadge(isActive: boolean) {
  if (isActive) return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span>;
  return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">Inactive</span>;
}

export function CustomersTable() {
  const customers = useCustomerStore((s) => s.customers);
  const loading = useCustomerStore((s) => s.loading);
  const error = useCustomerStore((s) => s.error);
  const page = useCustomerStore((s) => s.page);
  const totalPages = useCustomerStore((s) => s.totalPages);
  const total = useCustomerStore((s) => s.total);
  const setPage = useCustomerStore((s) => s.setPage);
  const openCustomer = useCustomerStore((s) => s.openCustomer);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { isSuperAdmin } = useWorkspace();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
                <p className="text-xs text-gray-500 truncate">{c.phone || c.email}</p>
              </div>
            </div>
          );
        },
      },
      ...(isSuperAdmin
        ? [
            {
              accessorKey: "branch",
              header: () => (
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Branch</span>
              ),
              cell: ({ row }: { row: { original: Customer } }) => {
                const branch = row.original.branch;
                return (
                  <span className="text-sm text-gray-600">
                    {branch ? `${branch.name} (${branch.code})` : "—"}
                  </span>
                );
              },
            } satisfies ColumnDef<Customer>,
          ]
        : []),
      {
        accessorKey: "email",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Email</span>,
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600">{(getValue() as string) || "—"}</span>
        ),
      },
      {
        accessorKey: "isActive",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</span>,
        cell: ({ getValue }) => getStatusBadge(getValue() as boolean),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined
            {column.getIsSorted() === "asc" ? <ArrowUp className="h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600">{formatDate(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: "lastLoginAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Active
            {column.getIsSorted() === "asc" ? <ArrowUp className="h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return <span className="text-sm text-gray-600">{val ? formatDate(val) : "—"}</span>;
        },
      },
      {
        id: "actions",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</span>,
        cell: ({ row }) => (
          <button
            onClick={() => openCustomer(row.original.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
        ),
      },
    ],
    [openCustomer, isSuperAdmin]
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
    <div className="space-y-3">
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>Failed to load customers: {error}</span>
          <button
            onClick={() => fetchCustomers()}
            className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-500">
                  Loading customers...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => openCustomer(row.original.id)}
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
      <div className="border-t border-gray-100 bg-gray-50/30 px-4 py-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-700">{customers.length}</span> of <span className="font-semibold text-gray-700">{total}</span> customer{total !== 1 && "s"}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3 w-3" /> Prev
            </button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
