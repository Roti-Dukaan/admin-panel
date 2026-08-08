"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Header } from "@/components/layout/header";
import { supportApi, type SupportDashboard, type SupportTicket } from "@/lib/api/support.api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_FOR_BRANCH: "bg-purple-100 text-purple-700",
  WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REOPENED: "bg-red-100 text-red-700",
};

export default function SupportDashboardPage() {
  const [dashboard, setDashboard] = useState<SupportDashboard | null>(null);
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [dashResult, ticketsResult] = await Promise.allSettled([
      supportApi.getDashboard(),
      supportApi.list({ limit: 10 }),
    ]);

    if (dashResult.status === "fulfilled") {
      setDashboard(dashResult.value.data);
    } else {
      console.error("Failed to load support dashboard stats", dashResult.reason);
    }

    if (ticketsResult.status === "fulfilled") {
      setRecentTickets(ticketsResult.value.data.items);
    } else {
      console.error("Failed to load support tickets", ticketsResult.reason);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header title="Customer Support" subtitle="Support dashboard and ticket management" />
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Customer Support" subtitle="Support dashboard and ticket management" />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Open Tickets", value: dashboard?.openTickets ?? 0, icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
            { label: "In Progress", value: dashboard?.inProgressTickets ?? 0, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
            { label: "Resolved Today", value: dashboard?.resolvedToday ?? 0, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
            { label: "Avg Resolution", value: `${dashboard?.avgResolutionTimeHours ?? 0}h`, icon: BarChart3, color: "text-purple-600 bg-purple-50" },
            { label: "Satisfaction", value: `${dashboard?.customerSatisfaction ?? 0}/5`, icon: Star, color: "text-orange-600 bg-orange-50" },
          ].map((kpi) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${kpi.color}`}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-gray-500">{kpi.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tickets by Category */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <BarChart3 className="h-4 w-4" />
                  Tickets by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(dashboard?.ticketsByCategory ?? []).slice(0, 8).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{cat.category.replace(/_/g, " ")}</span>
                    <span className="font-medium text-gray-900">{cat.count}</span>
                  </div>
                ))}
                {(!dashboard?.ticketsByCategory || dashboard.ticketsByCategory.length === 0) && (
                  <p className="text-sm text-gray-400">No data yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tickets by Branch */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Users className="h-4 w-4" />
                  Tickets by Branch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(dashboard?.ticketsByBranch ?? []).slice(0, 8).map((branch) => (
                  <div key={branch.branchId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{branch.branchName}</span>
                    <span className="font-medium text-gray-900">{branch.count}</span>
                  </div>
                ))}
                {(!dashboard?.ticketsByBranch || dashboard.ticketsByBranch.length === 0) && (
                  <p className="text-sm text-gray-400">No data yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tickets by Executive */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <TrendingUp className="h-4 w-4" />
                  Tickets by Executive
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(dashboard?.ticketsByExecutive ?? []).slice(0, 8).map((exec) => (
                  <div key={exec.executiveId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{exec.executiveName}</span>
                    <span className="font-medium text-gray-900">{exec.count}</span>
                  </div>
                ))}
                {(!dashboard?.ticketsByExecutive || dashboard.ticketsByExecutive.length === 0) && (
                  <p className="text-sm text-gray-400">No data yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Tickets Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Recent Tickets</CardTitle>
              <Link
                href="/support/list"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left font-medium text-gray-500">Ticket</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Customer</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Category</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Status</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5">
                          <Link
                            href={`/support/${ticket.id}`}
                            className="font-medium text-orange-600 hover:text-orange-700"
                          >
                            {ticket.ticketNumber}
                          </Link>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{ticket.subject}</p>
                        </td>
                        <td className="py-2.5 text-gray-700">{ticket.customer?.name ?? "N/A"}</td>
                        <td className="py-2.5 text-gray-600 text-xs">{ticket.category.replace(/_/g, " ")}</td>
                        <td className="py-2.5">
                          <Badge className={`text-xs ${STATUS_COLORS[ticket.status]}`}>
                            {ticket.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-gray-500 text-xs">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {recentTickets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No tickets yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
