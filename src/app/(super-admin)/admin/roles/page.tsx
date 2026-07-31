"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Shield,
  Plus,
  RefreshCw,
  Users,
  Eye,
  Pencil,
  Trash2,
  Crown,
  UserCog,
  ChefHat,
  Truck,
  Headphones,
  Star,
  Key,
  Lock,
  Globe,
  Settings as SettingsIcon,
  Bookmark,
  DollarSign,
} from "lucide-react";
import { useRoleStore } from "@/features/rbac/hooks/useRoles";
import { RoleHierarchy } from "@/features/rbac/components/RoleHierarchy";
import { AuditPreview } from "@/features/rbac/components/AuditPreview";
import { RoleCloneDialog } from "@/features/rbac/components/RoleCloneDialog";
import { RoleDrawer } from "@/features/rbac/components/RoleDrawer";
import { RolesSkeleton } from "@/features/rbac/components/SkeletonLoader";
import type { Role } from "@/features/rbac/types/role";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";

const iconMap: Record<string, React.ElementType> = {
  Shield, Crown, Users, UserCog, ChefHat, Truck, Headphones, DollarSign,
  Star, Key, Lock, Globe, Settings: SettingsIcon, Bookmark,
};

export default function RolesPage() {
  const roles = useRoleStore((s) => s.roles);
  const users = useRoleStore((s) => s.users);
  const setSelectedRole = useRoleStore((s) => s.setSelectedRole);
  const setDrawerOpen = useRoleStore((s) => s.setDrawerOpen);
  const setDrawerMode = useRoleStore((s) => s.setDrawerMode);
  const setRoleToDelete = useRoleStore((s) => s.setRoleToDelete);
  const setDeleteModalOpen = useRoleStore((s) => s.setDeleteModalOpen);
  const deleteRole = useRoleStore((s) => s.deleteRole);
  const getStats = useRoleStore((s) => s.getStats);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setStats(getStats());
  }, [getStats, roles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6">
          <RolesSkeleton />
        </div>
      </div>
    );
  }

  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

  const viewRole = (role: Role) => {
    setSelectedRole(role);
    setDrawerMode(role.isSystem ? "view" : "edit");
    setDrawerOpen(true);
  };

  const deleteCustomRole = (role: Role) => {
    if (role.isSystem) return;
    deleteRole(role.id);
  };

  const kpiCards = [
    { label: "Total Roles", value: stats.totalRoles, icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Custom Roles", value: stats.customRoles, icon: Plus, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "System Roles", value: stats.systemRoles, icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const RoleCard = ({ role }: { role: Role }) => {
    const Icon = iconMap[role.icon] || Shield;
    const userCount = users.filter((u) => u.roleId === role.id).length;
    const totalPerms = role.permissions.reduce((sum, p) => sum + p.actions.length, 0);

    return (
      <div className="rounded-xl border border-gray-200/80 bg-white p-5 transition-all hover:shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${role.color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color: role.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-base font-semibold text-gray-900 truncate">
                {role.name}
              </h4>
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                role.isSystem
                  ? "bg-blue-50 text-blue-700"
                  : "bg-violet-50 text-violet-700"
              )}>
                {role.isSystem ? "System" : "Custom"}
              </span>
              {role.status === "inactive" && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate max-w-md">
              {role.description}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Users className="h-3.5 w-3.5" />
                <span>{userCount} user{userCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Shield className="h-3.5 w-3.5" />
                <span>{totalPerms} permission{totalPerms !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => viewRole(role)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                role.isSystem
                  ? "border border-blue-200 text-blue-700 hover:bg-blue-50"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {role.isSystem ? (
                <><Eye className="h-3.5 w-3.5" /> View Permissions</>
              ) : (
                <><Pencil className="h-3.5 w-3.5" /> Edit</>
              )}
            </button>
            {!role.isSystem && (
              <button
                onClick={() => deleteCustomRole(role)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <Header
          title="Role & Permission Management"
          subtitle="Control access to every module in the Admin Portal."
          actions={
            <>
              <button
                onClick={() => setStats(getStats())}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setDrawerMode("create");
                  setDrawerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Role
              </button>
            </>
          }
        />

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200/80 bg-white p-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", card.bg)}>
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{card.value}</p>
                  <p className="text-[11px] font-medium text-gray-500">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Role Lists */}
          <div className="space-y-8">
            {/* System Roles */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    System Roles
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pre-defined roles with fixed permissions
                  </p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {systemRoles.length} role{systemRoles.length !== 1 ? "s" : ""}
                </span>
              </div>
              {systemRoles.length === 0 ? (
                <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center">
                  <Shield className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No system roles yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {systemRoles.map((role) => (
                    <RoleCard key={role.id} role={role} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Custom Roles */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Custom Roles
                  </h3>
                  <p className="text-xs text-gray-500">
                    User-defined roles with configurable permissions
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setDrawerMode("create");
                    setDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Role
                </button>
              </div>
              {customRoles.length === 0 ? (
                <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center">
                  <Plus className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">No custom roles yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Create custom roles to grant specific permissions
                  </p>
                  <button
                    onClick={() => {
                      setSelectedRole(null);
                      setDrawerMode("create");
                      setDrawerOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Role
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {customRoles.map((role) => (
                    <RoleCard key={role.id} role={role} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="space-y-6"
          >
            <RoleHierarchy />
            <AuditPreview />
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <RoleDrawer />
      <RoleCloneDialog
        open={false}
        sourceRole={null}
        onClose={() => {}}
      />
    </div>
  );
}
