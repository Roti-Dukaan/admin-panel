"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Copy,
  Archive,
  Trash2,
  Users,
  Eye,
  Shield,
  Crown,
  UserCog,
  ChefHat,
  Truck,
  Headphones,
  DollarSign,
  Star,
  Key,
  Lock,
  Globe,
  Settings,
  Bookmark,
} from "lucide-react";
import { useRoleStore } from "@/features/rbac/hooks/useRoles";
import { PermissionMatrix } from "@/features/rbac/components/PermissionMatrix";
import { AssignUsers } from "@/features/rbac/components/AssignUsers";
import { RoleSummary } from "@/features/rbac/components/RoleSummary";
import { RoleHierarchy } from "@/features/rbac/components/RoleHierarchy";
import { PermissionPreview } from "@/features/rbac/components/PermissionPreview";
import { RoleCloneDialog } from "@/features/rbac/components/RoleCloneDialog";
import { RoleEditor } from "@/features/rbac/components/RoleEditor";
import { RoleDetailSkeleton } from "@/features/rbac/components/SkeletonLoader";
import { ModulePermission } from "@/features/rbac/types/role";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Crown,
  Users,
  UserCog,
  ChefHat,
  Truck,
  Headphones,
  DollarSign,
  Eye,
  Star,
  Key,
  Lock,
  Globe,
  Settings,
  Bookmark,
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = use(params);
  const router = useRouter();
  const getRoleById = useRoleStore((s) => s.getRoleById);
  const getUsersByRole = useRoleStore((s) => s.getUsersByRole);
  const archiveRole = useRoleStore((s) => s.archiveRole);
  const deleteRole = useRoleStore((s) => s.deleteRole);
  const setCloneSourceRole = useRoleStore((s) => s.setCloneSourceRole);
  const setCloneDialogOpen = useRoleStore((s) => s.setCloneDialogOpen);
  const cloneDialogOpen = useRoleStore((s) => s.cloneDialogOpen);
  const cloneSourceRole = useRoleStore((s) => s.cloneSourceRole);

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"permissions" | "users" | "preview">("permissions");
  const [role, setRole] = useState(getRoleById(roleId));

  useEffect(() => {
    const timer = setTimeout(() => {
      setRole(getRoleById(roleId));
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [roleId, getRoleById]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("edit") === "true") {
      setEditMode(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6">
          <RoleDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Shield className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Role Not Found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The role you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push("/admin/roles")}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Roles
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (editMode) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6">
          <RoleEditor mode="edit" existingRole={role} />
        </div>
      </div>
    );
  }

  const Icon = iconMap[role.icon] || Shield;
  const roleUsers = getUsersByRole(role.id);

  const handleArchive = () => {
    archiveRole(role.id);
    setRole({ ...role, status: "inactive" });
    toast.success(`Role "${role.name}" archived`);
  };

  const handleDelete = () => {
    if (role.isSystem) {
      toast.error("System roles cannot be deleted");
      return;
    }
    deleteRole(role.id);
    toast.success(`Role "${role.name}" deleted`);
    router.push("/admin/roles");
  };

  const tabs = [
    { id: "permissions" as const, label: "Permissions", icon: Eye },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "preview" as const, label: "Preview", icon: Shield },
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/roles")}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${role.color}15` }}
              >
                <Icon className="h-6 w-6" style={{ color: role.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {role.name}
                  </h1>
                  {role.isSystem && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      SYSTEM
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                      role.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {role.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {role.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCloneSourceRole(role);
                setCloneDialogOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Clone
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            {!role.isSystem && (
              <>
                <button
                  onClick={handleArchive}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Role Info Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div className="rounded-xl border border-gray-200/80 bg-white p-4">
            <p className="text-[11px] font-medium text-gray-500">Created</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatDate(role.createdAt)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200/80 bg-white p-4">
            <p className="text-[11px] font-medium text-gray-500">
              Last Updated
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatDate(role.updatedAt)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200/80 bg-white p-4">
            <p className="text-[11px] font-medium text-gray-500">
              Users Assigned
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {roleUsers.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200/80 bg-white p-4">
            <p className="text-[11px] font-medium text-gray-500">
              Total Permissions
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {role.permissions.reduce((s, p) => s + p.actions.length, 0)}
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-1 rounded-xl border border-gray-200/80 bg-white p-1 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "users" && (
                  <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                    {roleUsers.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "permissions" && (
            <div className="rounded-xl border border-gray-200/80 bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  Permission Matrix
                </h3>
                <span className="text-xs text-gray-500">
                  {role.permissions.reduce((s, p) => s + p.actions.length, 0)}{" "}
                  permissions configured
                </span>
              </div>
              <PermissionMatrix
                permissions={role.permissions}
                readonly
              />
            </div>
          )}

          {activeTab === "users" && (
            <div className="rounded-xl border border-gray-200/80 bg-white p-6">
              <AssignUsers
                roleId={role.id}
                assignedUserIds={role.usersAssigned}
                readonly
              />
            </div>
          )}

          {activeTab === "preview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RoleSummary
                permissions={role.permissions}
                usersAssigned={roleUsers.length}
              />
              <PermissionPreview
                permissions={role.permissions}
                roleName={role.name}
                roleColor={role.color}
              />
            </div>
          )}
        </motion.div>
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
    </div>
  );
}
