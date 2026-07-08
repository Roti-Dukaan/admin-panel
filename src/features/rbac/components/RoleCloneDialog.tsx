"use client";

import { useState } from "react";
import { Role } from "../types/role";
import { useRoleStore } from "../hooks/useRoles";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";

interface RoleCloneDialogProps {
  open: boolean;
  sourceRole: Role | null;
  onClose: () => void;
}

export function RoleCloneDialog({ open, sourceRole, onClose }: RoleCloneDialogProps) {
  const cloneRole = useRoleStore((s) => s.cloneRole);
  const [newName, setNewName] = useState(
    sourceRole ? `${sourceRole.name} (Copy)` : ""
  );

  if (!open || !sourceRole) return null;

  const handleClone = () => {
    if (!newName.trim()) {
      toast.error("Please enter a role name");
      return;
    }
    cloneRole(sourceRole.id, newName.trim());
    toast.success(`Role "${newName}" created successfully`);
    setNewName("");
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
              <Copy className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Clone Role
              </h3>
              <p className="text-xs text-gray-500">
                Create a copy of "{sourceRole.name}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              New Role Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Senior Kitchen Manager"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              autoFocus
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">
              The following will be copied:
            </p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-xs text-gray-600">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                {sourceRole.permissions.length} module permissions
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-600">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                Role color and icon
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-600">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                All permission actions (view, create, update, etc.)
              </li>
            </ul>
            <p className="text-[11px] text-gray-400 mt-2">
              Note: User assignments will not be copied.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClone}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Clone Role
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
