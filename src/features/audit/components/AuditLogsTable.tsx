"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FNS_DATE_TIME_SECONDS } from "@/lib/date";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { AuditLog } from "../types/audit";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface AuditLogsTableProps {
  logs: AuditLog[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSelectLog: (log: AuditLog) => void;
}

function getActionColor(action: string) {
  if (action.includes("CREATED")) return "bg-emerald-50 text-emerald-700";
  if (action.includes("DELETED")) return "bg-red-50 text-red-700";
  if (action.includes("STATUS")) return "bg-amber-50 text-amber-700";
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "bg-blue-50 text-blue-700";
  return "bg-gray-50 text-gray-700";
}

function getEntityColor(entity: string) {
  const colors: Record<string, string> = {
    Order: "bg-blue-50 text-blue-700",
    Delivery: "bg-purple-50 text-purple-700",
    Menu: "bg-orange-50 text-orange-700",
    Customer: "bg-emerald-50 text-emerald-700",
    Settings: "bg-gray-100 text-gray-700",
    Kitchen: "bg-amber-50 text-amber-700",
    Payment: "bg-green-50 text-green-700",
    Role: "bg-indigo-50 text-indigo-700",
    Admin: "bg-rose-50 text-rose-700",
  };
  return colors[entity] || "bg-gray-50 text-gray-700";
}

export function AuditLogsTable({ logs, loading, page, totalPages, total, limit, onPageChange, onSelectLog }: AuditLogsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 bg-gray-50">
            <TableHead className="w-44">Time</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead className="w-36">Action</TableHead>
            <TableHead className="w-28">Entity</TableHead>
            <TableHead className="w-36">Entity ID</TableHead>
            <TableHead className="w-32">IP Address</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell><div className="h-4 w-28 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 rounded" /></TableCell>
                <TableCell />
              </TableRow>
            ))
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                No audit logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectLog(log)}>
                <TableCell className="text-sm text-gray-600">
                  {format(new Date(log.createdAt), FNS_DATE_TIME_SECONDS)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{log.admin.name || "—"}</p>
                    <p className="text-xs text-gray-500">{log.admin.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getEntityColor(log.entity)}`}>
                    {log.entity}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-mono text-gray-500 max-w-36 truncate">
                  {log.entityId ?? "—"}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {log.ipAddress ?? "—"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onSelectLog(log); }}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} logs
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
