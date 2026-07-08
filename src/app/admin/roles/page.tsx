"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  RefreshCw,
  Grid3X3,
  Users,
  UserCheck,
  UserX,
  Mail,
  Search,
  Filter,
  UserPlus,
} from "lucide-react";
import { useRoleStore } from "@/features/rbac/hooks/useRoles";
import { RolesTable } from "@/features/rbac/components/RolesTable";
import { RoleHierarchy } from "@/features/rbac/components/RoleHierarchy";
import { AuditPreview } from "@/features/rbac/components/AuditPreview";
import { RoleCloneDialog } from "@/features/rbac/components/RoleCloneDialog";
import { InviteUserDialog } from "@/features/rbac/components/InviteUserDialog";
import { RolesSkeleton } from "@/features/rbac/components/SkeletonLoader";
import { RoleStatus } from "@/features/rbac/types/role";
import { cn } from "@/lib/utils";

export default function RolesPage() {
  const router = useRouter();
  const getStats = useRoleStore((s) => s.getStats);
  const filters = useRoleStore((s) => s.filters);
  const setSearch = useRoleStore((s) => s.setSearch);
  const setStatusFilter = useRoleStore((s) => s.setStatusFilter);
  const setTypeFilter = useRoleStore((s) => s.setTypeFilter);
  const clearFilters = useRoleStore((s) => s.clearFilters);
  const cloneDialogOpen = useRoleStore((s) => s.cloneDialogOpen);
  const setCloneDialogOpen = useRoleStore((s) => s.setCloneDialogOpen);
  const cloneSourceRole = useRoleStore((s) => s.cloneSourceRole);
  const setCloneSourceRole = useRoleStore((s) => s.setCloneSourceRole);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(getStats());
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setStats(getStats());
  }, [getStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6">
          <RolesSkeleton />
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Roles",
      value: stats.totalRoles,
      icon: Shield,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Custom Roles",
      value: stats.customRoles,
      icon: Plus,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "System Roles",
      value: stats.systemRoles,
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Inactive Users",
      value: stats.inactiveUsers,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Pending Invitations",
      value: stats.pendingInvitations,
      icon: Mail,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Role & Permission Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Control access to every module in the Admin Portal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setStats(getStats());
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => setInviteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Invite User
            </button>
            <button
              onClick={() => router.push("/admin/roles/new")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200/80 bg-white p-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    card.bg
                  )}
                >
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">
                    {card.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
              {(["all", "system", "custom"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all capitalize",
                    filters.type === type
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
              {(["all", "active", "inactive"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all capitalize",
                    filters.status === status
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Roles Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <RolesTable />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-6"
          >
            <RoleHierarchy />
            <AuditPreview />
          </motion.div>
        </div>
      </div>

      {/* Clone Dialog */}
      <RoleCloneDialog
        open={cloneDialogOpen}
        sourceRole={cloneSourceRole}
        onClose={() => {
          setCloneDialogOpen(false);
          setCloneSourceRole(null);
        }}
      />

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
      />
    </div>
  );
}
