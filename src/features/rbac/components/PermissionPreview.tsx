"use client";

import { useMemo } from "react";
import { RBAC_MODULES, ModulePermission, RBACModule } from "../types/role";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionPreviewProps {
  permissions: ModulePermission[];
  roleName: string;
  roleColor: string;
}

export function PermissionPreview({ permissions, roleName, roleColor }: PermissionPreviewProps) {
  const permMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    permissions.forEach((p) => {
      map[p.module] = p.actions;
    });
    return map;
  }, [permissions]);

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${roleColor}15` }}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: roleColor }}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{roleName}</h3>
          <p className="text-[11px] text-gray-400">Permission Preview</p>
        </div>
      </div>

      <div className="space-y-2">
        {RBAC_MODULES.map((module) => {
          const actions = permMap[module.key] || [];
          const hasAccess = actions.length > 0;
          return (
            <div
              key={module.key}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
                hasAccess ? "bg-emerald-50/50" : "bg-gray-50/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                {hasAccess ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <X className="h-4 w-4 text-gray-300" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    hasAccess ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {module.label}
                </span>
              </div>
              {hasAccess && (
                <div className="flex flex-wrap gap-1">
                  {actions.map((action) => (
                    <span
                      key={action}
                      className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
