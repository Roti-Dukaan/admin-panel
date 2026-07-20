"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Copy, Download } from "lucide-react";
import { usePaymentStore } from "../hooks/usePayments";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import type { Payment, PaymentMethodType } from "../types/payment";
import { PAYMENT_METHOD_CONFIG } from "../types/payment";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api/orders.api";
import { InvoiceCard } from "@/features/orders/components/InvoiceCard";

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function getMethodLabel(method: PaymentMethodType) {
  return PAYMENT_METHOD_CONFIG[method]?.label || method;
}

export function PaymentsTable() {
  const getFilteredPayments = usePaymentStore((s) => s.getFilteredPayments);
  const openPaymentDrawer = usePaymentStore((s) => s.openPaymentDrawer);
  const payments = useMemo(() => getFilteredPayments(), [getFilteredPayments]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "paymentId",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Transaction ID
            {column.getIsSorted() === "asc" ? <ArrowUp className="h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-mono text-gray-700">{row.original.paymentId}</span>
        ),
      },
      {
        accessorKey: "orderId",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Order ID</span>,
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-gray-900">{row.original.orderId}</span>
        ),
      },
      {
        accessorKey: "customerName",
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
          const p = row.original;
          return (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.customerName}</p>
              <p className="text-xs text-gray-500 truncate">{p.customerPhone}</p>
            </div>
          );
        },
      },
      {
        id: "phone",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Phone</span>,
        cell: ({ row }) => (
          <span className="text-xs text-gray-600">{row.original.customerPhone}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            {column.getIsSorted() === "asc" ? <ArrowUp className="h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-bold text-gray-900">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Method</span>,
        cell: ({ row }) => (
          <span className="text-xs font-medium text-gray-600">{getMethodLabel(row.original.paymentMethod)}</span>
        ),
      },
      {
        accessorKey: "gateway",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gateway</span>,
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 capitalize">
            {row.original.gateway}
          </span>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</span>,
        cell: ({ getValue }) => <PaymentStatusBadge status={getValue() as Payment['paymentStatus']} />,
      },
      {
        accessorKey: "transactionTime",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Time
            {column.getIsSorted() === "asc" ? <ArrowUp className="h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-xs text-gray-600 whitespace-nowrap">{formatDateTime(getValue() as number)}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</span>,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openPaymentDrawer(p);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-3 w-3" />
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  ordersApi
                    .getInvoice(p.orderId)
                    .then((view) => {
                      if (view.invoice?.downloadUrl) {
                        window.open(view.invoice.downloadUrl, "_blank", "noopener,noreferrer");
                      } else {
                        toast.error("Invoice not available yet");
                      }
                    })
                    .catch(() => toast.error("Could not fetch invoice"));
                }}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                title="Download Invoice"
              >
                <Download className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(p.paymentId);
                  toast.success("Payment ID copied!");
                }}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                title="Copy Payment ID"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          );
        },
      },
    ],
    [openPaymentDrawer]
  );

  const table = useReactTable({
    data: payments,
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
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <CreditCard className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">No Transactions Found</p>
                      <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search criteria.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => openPaymentDrawer(row.original)}
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
      {payments.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/30 px-4 py-2.5">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{payments.length}</span> transaction{payments.length !== 1 && "s"}
          </p>
        </div>
      )}
    </div>
  );
}

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  );
}
