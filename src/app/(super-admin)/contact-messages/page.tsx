"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { ContactMessagesTable } from "@/features/contact-messages/components/ContactMessagesTable";
import { ContactMessageDetail } from "@/features/contact-messages/components/ContactMessageDetail";
import { contactMessagesApi } from "@/features/contact-messages/services/contact-messages.api";
import type {
  ContactMessage,
  ContactMessageFilters,
  ContactMessageStatus,
} from "@/features/contact-messages/types/contact-message";

const STATUS_OPTIONS: Array<ContactMessageStatus | "all"> = ["all", "NEW", "READ", "ARCHIVED"];

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState<Partial<ContactMessageFilters>>({
    status: "all",
    search: "",
    page: 1,
    limit: 50,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contactMessagesApi.list(filters);
      setMessages(data.items);
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch {
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: keyof ContactMessageFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSelectMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowDetail(true);

    if (message.status === "NEW") {
      try {
        const updated = await contactMessagesApi.updateStatus(message.id, "READ");
        setSelectedMessage(updated);
        setMessages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } catch {
        // Non-blocking: detail still opens even if auto-mark-read fails
      }
    }
  };

  const handleStatusChange = async (id: string, status: ContactMessageStatus) => {
    setUpdating(true);
    try {
      const updated = await contactMessagesApi.updateStatus(id, status);
      setSelectedMessage(updated);
      setMessages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(`Message marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update message status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Contact Messages"
        subtitle="Inbound messages from the website contact form."
      />

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search name, email, subject..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
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

        <ContactMessagesTable
          messages={messages}
          loading={loading}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={handlePageChange}
          onSelectMessage={handleSelectMessage}
        />
      </div>

      <ContactMessageDetail
        message={selectedMessage}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedMessage(null);
        }}
        onStatusChange={handleStatusChange}
        updating={updating}
      />
    </div>
  );
}
