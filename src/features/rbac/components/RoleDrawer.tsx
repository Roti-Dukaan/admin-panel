"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useRoleStore } from "../hooks/useRoles";
import { PermissionMatrix } from "./PermissionMatrix";
import type { ModulePermission } from "../types/role";

export function RoleDrawer() {
  const drawerOpen = useRoleStore((s) => s.drawerOpen);
  const drawerMode = useRoleStore((s) => s.drawerMode);
  const selectedRole = useRoleStore((s) => s.selectedRole);
  const setDrawerOpen = useRoleStore((s) => s.setDrawerOpen);
  const createRole = useRoleStore((s) => s.createRole);
  const updateRole = useRoleStore((s) => s.updateRole);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (drawerMode === "create") {
      setName("");
      setDescription("");
      setPermissions([]);
    } else if (selectedRole && (drawerMode === "edit" || drawerMode === "view")) {
      setName(selectedRole.name);
      setDescription(selectedRole.description);
      setPermissions(selectedRole.permissions);
    }
  }, [drawerMode, selectedRole, drawerOpen]);

  const isViewOnly = drawerMode === "view" || (selectedRole?.isSystem && drawerMode === "edit");

  const handleSave = () => {
    if (!name.trim() || isViewOnly) return;
    setSaving(true);

    if (drawerMode === "create") {
      createRole({
        name: name.trim(),
        description: description.trim(),
        color: "#6366f1",
        icon: "Shield",
        status: "active",
        isSystem: false,
        permissions,
        usersAssigned: [],
        hierarchyLevel: 1,
      });
    } else if (drawerMode === "edit" && selectedRole) {
      updateRole(selectedRole.id, {
        name: name.trim(),
        description: description.trim(),
        permissions,
      });
    }

    setTimeout(() => {
      setSaving(false);
      setDrawerOpen(false);
    }, 300);
  };

  if (!drawerOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={() => setDrawerOpen(false)}
      />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-[55vw] border-l border-gray-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {drawerMode === "create"
                ? "Create Custom Role"
                : drawerMode === "edit"
                ? "Edit Role"
                : "View Role"}
            </h3>
            <p className="text-sm text-gray-500">
              {drawerMode === "create"
                ? "Define a new role with custom permissions"
                : drawerMode === "edit"
                ? "Modify role name, description, or permissions"
                : selectedRole?.isSystem
                ? "System role — permissions are fixed"
                : "View role details"}
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Role Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isViewOnly}
              placeholder="e.g., Inventory Manager"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 read-only:bg-gray-50 read-only:text-gray-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={isViewOnly}
              placeholder="Describe what this role can do..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 read-only:bg-gray-50 read-only:text-gray-500 resize-none"
            />
          </div>

          {/* Permission Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Permission Matrix
              </label>
              {isViewOnly && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  Read Only
                </span>
              )}
            </div>
            <PermissionMatrix
              permissions={permissions}
              onChange={isViewOnly ? undefined : setPermissions}
              readonly={isViewOnly}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {!isViewOnly && (
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : drawerMode === "create" ? "Create Role" : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
