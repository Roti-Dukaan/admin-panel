"use client";

import { ModulePermission, RBAC_MODULES } from "../types/role";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSummaryProps {
  permissions: ModulePermission[];
  usersAssigned: number;
}

export function RoleSummary({ permissions, usersAssigned }: RoleSummaryProps) {
  const totalPerms = permissions.reduce((sum, p) => sum + p.actions.length, 0);
  const modulesAccessible = permissions.filter((p) => p.actions.length > 0).length;
  const restrictedModules = RBAC_MODULES.length - modulesAccessible;

  const stats = [
    {
      label: "Total Permissions",
      value: totalPerms,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Users Assigned",
      value: usersAssigned,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Modules Accessible",
      value: modulesAccessible,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Restricted Modules",
      value: restrictedModules,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Role Summary
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-100 p-3"
          >
            <div
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-2 py-1 text-lg font-bold",
                stat.color,
                stat.bg
              )}
            >
              {stat.value}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-gray-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
