"use client";

import { useMemo } from "react";
import { Shield, Check, X } from "lucide-react";
import { RBAC_MODULES, PERMISSION_ACTIONS, ModulePermission, PermissionAction } from "../types/role";
import { cn } from "@/lib/utils";

interface PermissionMatrixProps {
  permissions: ModulePermission[];
  onChange?: (permissions: ModulePermission[]) => void;
  readonly?: boolean;
}

export function PermissionMatrix({ permissions, onChange, readonly = false }: PermissionMatrixProps) {
  const permMap = useMemo(() => {
    const map: Record<string, PermissionAction[]> = {};
    permissions.forEach((p) => {
      map[p.module] = p.actions;
    });
    return map;
  }, [permissions]);

  const togglePermission = (module: string, action: PermissionAction) => {
    if (readonly || !onChange) return;
    const current = permMap[module] || [];
    const exists = current.includes(action);
    const updated = exists
      ? current.filter((a) => a !== action)
      : [...current, action];

    const newPermissions = permissions.filter((p) => p.module !== module);
    if (updated.length > 0) {
      newPermissions.push({ module: module as ModulePermission['module'], actions: updated });
    }
    onChange(newPermissions);
  };

  const toggleAllModule = (module: string) => {
    if (readonly || !onChange) return;
    const current = permMap[module] || [];
    const allActions = PERMISSION_ACTIONS.map((a) => a.key);
    const hasAll = allActions.every((a) => current.includes(a));

    const newPermissions = permissions.filter((p) => p.module !== module);
    if (!hasAll && current.length > 0) {
      newPermissions.push({ module: module as ModulePermission['module'], actions: allActions });
    } else if (!hasAll) {
      newPermissions.push({ module: module as ModulePermission['module'], actions: ['view'] });
    }
    onChange(newPermissions);
  };

  const isModuleChecked = (module: string, action: PermissionAction) => {
    return (permMap[module] || []).includes(action);
  };

  const getModulePermCount = (module: string) => {
    return (permMap[module] || []).length;
  };

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="sticky top-0 z-10 grid grid-cols-[280px_repeat(7,1fr)] gap-3 rounded-t-xl border border-gray-200/80 bg-gray-50 px-4 py-3">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Module
        </div>
        {PERMISSION_ACTIONS.map((action) => (
          <div
            key={action.key}
            className="text-center text-xs font-bold uppercase tracking-wider text-gray-600"
          >
            {action.label}
          </div>
        ))}
      </div>

      {/* Module Rows */}
      {RBAC_MODULES.map((module) => {
        const count = getModulePermCount(module.key);
        return (
          <div
            key={module.key}
            className={cn(
              "grid grid-cols-[280px_repeat(7,1fr)] gap-3 border border-gray-200/80 bg-white px-4 py-3 transition-colors hover:bg-gray-50/50",
              count === 0 && "opacity-60"
            )}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAllModule(module.key)}
                disabled={readonly}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                  count > 0 && count < PERMISSION_ACTIONS.length
                    ? "border-blue-500 bg-blue-500"
                    : count === PERMISSION_ACTIONS.length
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300 bg-white",
                  !readonly && "cursor-pointer hover:border-gray-400"
                )}
              >
                {count === PERMISSION_ACTIONS.length && (
                  <Check className="h-3 w-3 text-white" />
                )}
                {count > 0 && count < PERMISSION_ACTIONS.length && (
                  <div className="h-1.5 w-1.5 rounded-sm bg-white" />
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {module.label}
                </p>
                <p className="text-[11px] text-gray-400">
                  {module.description}
                </p>
              </div>
            </div>
            {PERMISSION_ACTIONS.map((action) => {
              const checked = isModuleChecked(module.key, action.key);
              return (
                <div
                  key={action.key}
                  className="flex items-center justify-center"
                >
                  <button
                    onClick={() => togglePermission(module.key, action.key)}
                    disabled={readonly}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                      checked
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-gray-300 bg-white",
                      !readonly && "cursor-pointer hover:border-gray-400"
                    )}
                  >
                    {checked && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
