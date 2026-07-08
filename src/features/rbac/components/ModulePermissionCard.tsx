"use client";

import { Check, X } from "lucide-react";
import { RBACModule, PermissionAction, ModulePermission, RBAC_MODULES, PERMISSION_ACTIONS } from "../types/role";
import { cn } from "@/lib/utils";

interface ModulePermissionCardProps {
  module: RBACModule;
  permissions: ModulePermission[];
  onChange?: (permissions: ModulePermission[]) => void;
  readonly?: boolean;
}

export function ModulePermissionCard({ module, permissions, onChange, readonly = false }: ModulePermissionCardProps) {
  const moduleInfo = RBAC_MODULES.find((m) => m.key === module);
  const currentPerms = permissions.find((p) => p.module === module);
  const actions = currentPerms?.actions || [];

  const toggle = (action: PermissionAction) => {
    if (readonly || !onChange) return;
    const exists = actions.includes(action);
    const updated = exists
      ? actions.filter((a) => a !== action)
      : [...actions, action];

    const newPermissions = permissions.filter((p) => p.module !== module);
    if (updated.length > 0) {
      newPermissions.push({ module, actions: updated });
    }
    onChange(newPermissions);
  };

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 transition-all hover:shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            {moduleInfo?.label || module}
          </h4>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {moduleInfo?.description}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
            actions.length > 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {actions.length} / {PERMISSION_ACTIONS.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PERMISSION_ACTIONS.map((action) => {
          const checked = actions.includes(action.key);
          return (
            <button
              key={action.key}
              onClick={() => toggle(action.key)}
              disabled={readonly}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all",
                checked
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-gray-50 text-gray-400",
                !readonly && "cursor-pointer hover:border-gray-300"
              )}
            >
              {checked ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
