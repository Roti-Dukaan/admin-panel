"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Save,
  ArrowLeft,
  Shield,
  Palette,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRoleStore } from "../hooks/useRoles";
import {
  Role,
  ModulePermission,
  RBACModule,
  PermissionAction,
  ROLE_COLORS,
  ROLE_ICONS,
  RBAC_MODULES,
  PERMISSION_ACTIONS,
} from "../types/role";
import { PermissionMatrix } from "./PermissionMatrix";
import { AssignUsers } from "./AssignUsers";
import { RoleSummary } from "./RoleSummary";
import { RoleHierarchy } from "./RoleHierarchy";
import { PermissionPreview } from "./PermissionPreview";
import { cn } from "@/lib/utils";

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  color: z.string(),
  icon: z.string(),
  status: z.enum(["active", "inactive"]),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleEditorProps {
  mode: "create" | "edit";
  existingRole?: Role;
}

export function RoleEditor({ mode, existingRole }: RoleEditorProps) {
  const router = useRouter();
  const createRole = useRoleStore((s) => s.createRole);
  const updateRole = useRoleStore((s) => s.updateRole);

  const [permissions, setPermissions] = useState<ModulePermission[]>(
    existingRole?.permissions || []
  );
  const [assignedUsers, setAssignedUsers] = useState<string[]>(
    existingRole?.usersAssigned || []
  );
  const [activeSection, setActiveSection] = useState<string>("general");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: existingRole?.name || "",
      description: existingRole?.description || "",
      color: existingRole?.color || "#6366f1",
      icon: existingRole?.icon || "Shield",
      status: existingRole?.status || "active",
    },
  });

  const watchedColor = watch("color");
  const watchedName = watch("name");

  const sections = [
    { id: "general", label: "General Information" },
    { id: "permissions", label: "Permission Matrix" },
    { id: "users", label: "User Assignment" },
    { id: "preview", label: "Preview & Summary" },
  ];

  const onSubmit = (data: RoleFormData) => {
    if (mode === "create") {
      const newRole = createRole({
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        status: data.status,
        isSystem: false,
        permissions,
        usersAssigned: assignedUsers,
        hierarchyLevel: 6,
      });
      toast.success(`Role "${data.name}" created successfully`);
      router.push(`/admin/roles/${newRole.id}`);
    } else if (existingRole) {
      updateRole(existingRole.id, {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        status: data.status,
        permissions,
        usersAssigned: assignedUsers,
      });
      toast.success(`Role "${data.name}" updated successfully`);
      router.push(`/admin/roles/${existingRole.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sticky Save Bar */}
      <div className="sticky top-0 z-30 -mx-6 -mt-6 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {mode === "create" ? "Create New Role" : `Edit: ${existingRole?.name}`}
              </h2>
              <p className="text-[11px] text-gray-500">
                {mode === "create"
                  ? "Define role name, permissions, and assign users"
                  : "Modify role settings and permissions"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-[11px] text-amber-600 font-medium">
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              {mode === "create" ? "Create Role" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar Navigation */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left",
                  activeSection === section.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Mobile Section Tabs */}
          <div className="flex lg:hidden overflow-x-auto gap-1 p-1 bg-gray-100 rounded-xl">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all",
                  activeSection === section.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* General Information */}
          {(activeSection === "general" || true) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-200/80 bg-white p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <Shield className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">
                  General Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Role Name *
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="e.g., Senior Kitchen Manager"
                    className={cn(
                      "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1",
                      errors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                        : "border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Description *
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Describe what this role can do..."
                    className={cn(
                      "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 resize-none",
                      errors.description
                        ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                        : "border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Role Color
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ROLE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setValue("color", color.value)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all",
                          watchedColor === color.value
                            ? "border-gray-900 scale-110"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Role Icon
                  </label>
                  <select
                    {...register("icon")}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    {ROLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Permission Matrix */}
          {(activeSection === "permissions" || true) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-gray-200/80 bg-white p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Permission Matrix
                  </h3>
                </div>
                <span className="text-xs text-gray-500">
                  {permissions.reduce((s, p) => s + p.actions.length, 0)}{" "}
                  permissions configured
                </span>
              </div>
              <PermissionMatrix
                permissions={permissions}
                onChange={setPermissions}
              />
            </motion.div>
          )}

          {/* User Assignment */}
          {(activeSection === "users" || true) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-gray-200/80 bg-white p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <Users className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">
                  User Assignment
                </h3>
              </div>
              <AssignUsers
                roleId={existingRole?.id || "new"}
                assignedUserIds={assignedUsers}
                onUpdate={setAssignedUsers}
              />
            </motion.div>
          )}

          {/* Preview & Summary */}
          {(activeSection === "preview" || true) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <RoleSummary
                permissions={permissions}
                usersAssigned={assignedUsers.length}
              />
              <PermissionPreview
                permissions={permissions}
                roleName={watchedName || "New Role"}
                roleColor={watchedColor}
              />
            </motion.div>
          )}
        </div>
      </div>
    </form>
  );
}
