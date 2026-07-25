"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Header } from "@/components/layout/header";
import { supportApi, type SupportTicket, type SupportQueryParams, type TicketStatus, type TicketPriority, type TicketCategory } from "@/lib/api/support.api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_FOR_BRANCH: "bg-purple-100 text-purple-700",
  WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REOPENED: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const ALL_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_FOR_BRANCH", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED", "REOPENED"];
const ALL_PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const ALL_CATEGORIES: TicketCategory[] = ["ORDER_NOT_RECEIVED", "LATE_DELIVERY", "WRONG_ITEM", "MISSING_ITEM", "FOOD_QUALITY", "DAMAGED_PACKAGE", "PAYMENT", "REFUND", "SUBSCRIPTION", "ACCOUNT", "PROMOTION", "OTHER"];

export default function BranchSupportListPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SupportQueryParams>({ page: 1, limit: 15 });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supportApi.list(filters);
      setTickets(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 15 });
    setSearchInput("");
  };

  const hasActiveFilters = filters.status || filters.priority || filters.category || filters.branchId || filters.assignedToId || filters.search || filters.dateFrom || filters.dateTo;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Support Tickets"
        subtitle={`Viewing ${total} tickets`}
        showSearch={false}
      />

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket #, customer, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-orange-500" />}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-gray-500">
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-gray-100">
              <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-6">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, status: (e.target.value || undefined) as TicketStatus, page: 1 }))}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                  >
                    <option value="">All</option>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Priority</label>
                  <select
                    value={filters.priority || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, priority: (e.target.value || undefined) as TicketPriority, page: 1 }))}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                  >
                    <option value="">All</option>
                    {ALL_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Category</label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, category: (e.target.value || undefined) as TicketCategory, page: 1 }))}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                  >
                    <option value="">All</option>
                    {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Order #</label>
                  <input
                    type="text"
                    placeholder="Order number"
                    value={filters.orderNumber || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, orderNumber: e.target.value || undefined, page: 1 }))}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value || undefined, page: 1 }))}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value || undefined, page: 1 }))}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="border-gray-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Ticket</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Assigned</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400">
                        No tickets found
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/branch/support/${ticket.id}`} className="font-medium text-orange-600 hover:text-orange-700">
                            {ticket.ticketNumber}
                          </Link>
                          <p className="max-w-[200px] truncate text-xs text-gray-500">{ticket.subject}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700">{ticket.customer?.name ?? "N/A"}</p>
                          <p className="text-xs text-gray-500">{ticket.customer?.phone ?? ""}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {ticket.order?.orderNumber ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">{ticket.category.replace(/_/g, " ")}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {ticket.assignedTo?.name ?? "Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${STATUS_COLORS[ticket.status]}`}>
                            {ticket.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 15) + 1} to {Math.min((filters.page ?? 1) * (filters.limit ?? 15), total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(filters.page ?? 1) <= 1}
                    onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {filters.page ?? 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(filters.page ?? 1) >= totalPages}
                    onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
