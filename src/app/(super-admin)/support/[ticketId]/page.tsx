"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Header } from "@/components/layout/header";
import { supportApi, type SupportTicket, type SupportMessage, type SupportActivity } from "@/lib/api/support.api";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import {
  dismissSupportTicketAlerts,
  markSupportTicketViewed,
} from "@/features/support/utils/support-ticket-alerts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Paperclip, Clock, User, Building2, UtensilsCrossed, Truck, Star, MessageSquare } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_FOR_BRANCH: "bg-purple-100 text-purple-700",
  WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REOPENED: "bg-red-100 text-red-700",
};

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_BRANCH", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;
  const adminId = useAdminAuthStore((s) => s.user?.id ?? null);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"conversation" | "activity" | "internal">("conversation");
  const [customerOrders, setCustomerOrders] = useState<Array<{ id: string; orderNumber: string; status: string; grandTotal: number; createdAt: string }>>([]);

  const loadTicket = useCallback(async () => {
    try {
      const { data } = await supportApi.getById(ticketId);
      setTicket(data);
      if (data.customerId) {
        try {
          const { data: ordersData } = await supportApi.getCustomerOrders(data.customerId, 1, 5);
          setCustomerOrders(ordersData.items);
        } catch {
          // Ignore orders fetch failure
        }
      }
    } catch (err) {
      console.error("Failed to load ticket", err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    if (!adminId || !ticketId) return;
    markSupportTicketViewed(adminId, ticketId);
    dismissSupportTicketAlerts(ticketId);
  }, [adminId, ticketId]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await supportApi.addReply(ticketId, message);
      setMessage("");
      await loadTicket();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!internalNote.trim() || sending) return;
    setSending(true);
    try {
      await supportApi.addInternalNote(ticketId, internalNote);
      setInternalNote("");
      await loadTicket();
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await supportApi.updateStatus(ticketId, status as any);
      await loadTicket();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header title="Loading..." />
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header title="Ticket Not Found" />
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-gray-500">Ticket not found</p>
          <Button variant="outline" onClick={() => router.push("/support")} className="mt-4">
            Back to Support
          </Button>
        </div>
      </div>
    );
  }

  const allMessages = ticket.messages || [];
  const messages = allMessages.filter((m) => !m.isInternal);
  const activities = ticket.activities || [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        titleNode={
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/support")} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900">{ticket.ticketNumber}</h1>
                <Badge className={`text-xs ${STATUS_COLORS[ticket.status]}`}>{ticket.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="text-sm text-gray-500">{ticket.subject}</p>
            </div>
          </div>
        }
        showSearch={false}
      />

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {(["conversation", "activity", "internal"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "conversation" ? "Conversation" : tab === "activity" ? "Activity Log" : "Internal Notes"}
              </button>
            ))}
          </div>

          {/* Conversation Tab */}
          {activeTab === "conversation" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {/* Customer Description */}
              <Card className="border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{ticket.customer?.name ?? "Customer"}</p>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
                      <p className="mt-2 text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              {messages.map((msg) => (
                <Card key={msg.id} className="border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        msg.senderType === "ADMIN" ? "bg-orange-100" : msg.senderType === "SYSTEM" ? "bg-gray-100" : "bg-blue-100"
                      }`}>
                        {msg.senderType === "ADMIN" ? (
                          <User className="h-4 w-4 text-orange-600" />
                        ) : msg.senderType === "SYSTEM" ? (
                          <Clock className="h-4 w-4 text-gray-600" />
                        ) : (
                          <User className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {msg.senderType === "ADMIN" ? "Support Agent" : msg.senderType === "SYSTEM" ? "System" : ticket.customer?.name ?? "Customer"}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{msg.message}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {msg.attachments.map((att) => (
                              <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">
                                <Paperclip className="h-3 w-3" />
                                {att.fileType.split("/").pop()?.toUpperCase()}
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Reply Input */}
              {ticket.status !== "CLOSED" && (
                <Card className="border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your reply..."
                        rows={3}
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sending}
                        className="gap-2 bg-orange-500 hover:bg-orange-600"
                      >
                        <Send className="h-4 w-4" />
                        {sending ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-gray-100">
                <CardContent className="p-4">
                  {activities.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">No activity recorded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((act) => (
                        <div key={act.id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0">
                          <div className="rounded-full bg-gray-100 p-1.5">
                            <Clock className="h-3 w-3 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">{act.action.replace(/_/g, " ")}</span>
                              {act.oldValue && act.newValue && (
                                <span className="text-gray-500">: {act.oldValue} → {act.newValue}</span>
                              )}
                              {act.newValue && !act.oldValue && (
                                <span className="text-gray-500">: {act.newValue}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              by {act.performedByType} · {new Date(act.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Internal Notes Tab */}
          {activeTab === "internal" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <Card className="border-gray-100">
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Add an internal note (not visible to customer)..."
                      rows={3}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddInternalNote}
                      disabled={!internalNote.trim() || sending}
                      className="gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {allMessages.filter((m) => m.isInternal).map((note) => (
                <Card key={note.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Internal Note</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.message}</p>
                    <p className="mt-2 text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Ticket Info */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">Assigned To</p>
                <p className="text-sm font-medium text-gray-700">{ticket.assignedTo?.name ?? "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm text-gray-700">{ticket.category.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="text-sm text-gray-700">{ticket.source}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-700">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Updated</p>
                <p className="text-sm text-gray-700">{new Date(ticket.updatedAt).toLocaleString()}</p>
              </div>
              {ticket.closedAt && (
                <div>
                  <p className="text-xs text-gray-500">Closed</p>
                  <p className="text-sm text-gray-700">{new Date(ticket.closedAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Details */}
          {ticket.customer && (
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="h-4 w-4" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{ticket.customer.name}</p>
                <p className="text-xs text-gray-500">{ticket.customer.phone}</p>
                {ticket.customer.email && <p className="text-xs text-gray-500">{ticket.customer.email}</p>}
              </CardContent>
            </Card>
          )}

          {/* Customer Recent Orders */}
          {customerOrders.length > 0 && (
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Truck className="h-4 w-4" />
                  Recent Customer Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-orange-600">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-700">₹{order.grandTotal}</p>
                      <Badge className={`text-xs ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {ticket.order && (
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <UtensilsCrossed className="h-4 w-4" />
                  Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium text-orange-600">{ticket.order.orderNumber}</p>
                <p className="text-xs text-gray-500">Status: {ticket.order.status.replace(/_/g, " ")}</p>
                <p className="text-xs text-gray-500">Total: ₹{ticket.order.grandTotal}</p>
              </CardContent>
            </Card>
          )}

          {/* Branch Details */}
          {ticket.branch && (
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Building2 className="h-4 w-4" />
                  Branch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-700">{ticket.branch.name}</p>
              </CardContent>
            </Card>
          )}

          {/* Customer Rating */}
          {ticket.customerRating && (
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Star className="h-4 w-4" />
                  Customer Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= (ticket.customerRating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                {ticket.customerFeedback && (
                  <p className="text-sm text-gray-600">{ticket.customerFeedback}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
