"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { Header } from "@/components/layout/header";
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/DateRangeFilter";
import { AuditLogStats } from "@/features/audit/components/AuditLogStats";
import { AuditLogsTable } from "@/features/audit/components/AuditLogsTable";
import { AuditLogDetail } from "@/features/audit/components/AuditLogDetail";
import { auditApi } from "@/features/audit/services/audit.api";
import type { AuditLog, AuditLogFilters } from "@/features/audit/types/audit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

const ENTITY_OPTIONS = ["all", "Order", "Delivery", "Menu", "Customer", "Settings", "Kitchen", "Payment", "Role", "Admin", "Subscription"];
const ACTION_OPTIONS = ["all", "CREATED", "UPDATED", "DELETED", "STATUS_CHANGED", "KITCHEN_STATUS_UPDATED", "LOGIN", "LOGOUT"];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState<Partial<AuditLogFilters>>({
    entity: "all",
    action: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 50,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditApi.list(filters);
      setLogs(data.items);
      setPagination({ total: data.total, page: data.page, limit: data.limit, totalPages: data.totalPages });
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDateRangeChange = (value: DateRangeValue) => {
    const presets: Record<string, { dateFrom: string; dateTo: string }> = {
      today: { dateFrom: new Date().toISOString().split("T")[0], dateTo: new Date().toISOString().split("T")[0] },
      yesterday: {
        dateFrom: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        dateTo: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      },
      "7d": { dateFrom: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0], dateTo: new Date().toISOString().split("T")[0] },
      "30d": { dateFrom: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0], dateTo: new Date().toISOString().split("T")[0] },
      "this-month": {
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
        dateTo: new Date().toISOString().split("T")[0],
      },
      custom: { dateFrom: value.startDate || "", dateTo: value.endDate || "" },
    };
    const range = presets[value.preset] || presets.today;
    setFilters((prev) => ({ ...prev, ...range, page: 1 }));
  };

  const handleExport = () => {
    if (logs.length === 0) { toast.error("No data to export"); return; }
    const headers = ["Timestamp", "Admin", "Email", "Action", "Entity", "Entity ID", "IP Address", "User Agent"];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = logs.map((l) =>
      [new Date(l.createdAt).toISOString(), l.admin.name ?? "", l.admin.email, l.action, l.entity, l.entityId ?? "", l.ipAddress ?? "", l.userAgent ?? ""]
        .map((v) => escape(String(v))).join(",")
    );
    const csv = [headers.map(escape).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "audit-logs.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const dateRangeValue: DateRangeValue = {
    preset: filters.dateFrom || filters.dateTo ? "custom" : "today",
    startDate: filters.dateFrom || "",
    endDate: filters.dateTo || "",
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Audit Logs"
        subtitle="Track all admin actions and system changes."
        dateFilter={<DateRangeFilter value={dateRangeValue} onChange={handleDateRangeChange} />}
        actions={
          <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </button>
        }
      />

      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <AuditLogStats />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search action, entity, admin..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filters.entity || "all"} onValueChange={(v) => handleFilterChange("entity", v)}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Entities" /></SelectTrigger>
                <SelectContent>
                  {ENTITY_OPTIONS.map((e) => <SelectItem key={e} value={e}>{e === "all" ? "All Entities" : e}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.action || "all"} onValueChange={(v) => handleFilterChange("action", v)}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Actions" /></SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a === "all" ? "All Actions" : a.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <AuditLogsTable
            logs={logs}
            loading={loading}
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            onSelectLog={(log) => { setSelectedLog(log); setShowDetail(true); }}
          />
        </motion.div>
      </div>

      <AuditLogDetail log={selectedLog} isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedLog(null); }} />
    </div>
  );
}
