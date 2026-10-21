"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, ExternalLink, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serviceWaitlistApi } from "@/features/service-waitlist/service-waitlist.api";
import type {
  ServiceWaitlistEntry,
  ServiceWaitlistFilters,
  ServiceWaitlistStatus,
} from "@/features/service-waitlist/types";

const STATUS_OPTIONS: Array<ServiceWaitlistStatus | "all"> = ["all", "WAITING", "NOTIFIED"];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ServiceWaitlistPage() {
  const [entries, setEntries] = useState<ServiceWaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [filters, setFilters] = useState<ServiceWaitlistFilters>({
    status: "WAITING",
    search: "",
    page: 1,
    limit: 50,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await serviceWaitlistApi.list(filters);
      setEntries(data.items);
      setWaitingCount(data.waitingCount);
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch {
      toast.error("Failed to load the waitlist");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: "status" | "search", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleNotify = async () => {
    setNotifying(true);
    try {
      const result = await serviceWaitlistApi.notifyServiceable();
      if (result.notifiedCustomers === 0) {
        toast.info(`None of the ${result.checked} waiting locations are serviceable yet.`);
      } else {
        toast.success(
          `Notified ${result.notifiedCustomers} customer${result.notifiedCustomers === 1 ? "" : "s"}. ` +
            `${result.stillWaiting} still waiting.`,
        );
      }
      await fetchData();
    } catch {
      toast.error("Failed to notify customers");
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Service Area Waitlist"
        subtitle="Customers who tapped “Notify me” in locations without a kitchen."
        actions={
          <Button onClick={handleNotify} disabled={notifying || waitingCount === 0}>
            {notifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BellRing className="mr-2 h-4 w-4" />
            )}
            Notify now-serviceable
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Waiting customers</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{waitingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
            After a new branch opens or a delivery zone grows, click{" "}
            <span className="font-medium text-gray-900">Notify now-serviceable</span>. Everyone
            whose saved spot is now inside a delivery zone gets a push notification.
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search name, phone, area, city..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All statuses" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Notified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                    No waitlist requests found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{entry.customerName || "—"}</div>
                      <div className="text-xs text-gray-500">{entry.customerPhone || ""}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-gray-900" title={entry.formattedAddress ?? undefined}>
                        {entry.formattedAddress || "—"}
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>{entry.city || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={entry.status === "WAITING" ? "secondary" : "default"}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(entry.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(entry.notifiedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
              <span>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} requests
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
