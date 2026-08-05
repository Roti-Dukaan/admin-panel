"use client";

import { format } from "date-fns";
import { FNS_DATE_TIME } from "@/lib/date";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { ContactMessage } from "../types/contact-message";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface ContactMessagesTableProps {
  messages: ContactMessage[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSelectMessage: (message: ContactMessage) => void;
}

function getStatusColor(status: ContactMessage["status"]) {
  if (status === "NEW") return "bg-blue-50 text-blue-700";
  if (status === "READ") return "bg-emerald-50 text-emerald-700";
  return "bg-gray-100 text-gray-700";
}

export function ContactMessagesTable({
  messages,
  loading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onSelectMessage,
}: ContactMessagesTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 bg-gray-50">
            <TableHead className="w-44">Received</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell><div className="h-4 w-28 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-40 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-48 bg-gray-200 rounded" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded" /></TableCell>
                <TableCell />
              </TableRow>
            ))
          ) : messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                No contact messages yet
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow
                key={message.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectMessage(message)}
              >
                <TableCell className="text-sm text-gray-600">
                  {format(new Date(message.createdAt), FNS_DATE_TIME)}
                </TableCell>
                <TableCell className="text-sm font-medium">{message.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{message.email}</TableCell>
                <TableCell className="text-sm text-gray-700 max-w-xs truncate">
                  {message.subject}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColor(message.status)}`}
                  >
                    {message.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMessage(message);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
