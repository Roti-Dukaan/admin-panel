"use client";

import { ROLE_HIERARCHY } from "../mock/roles";
import { cn } from "@/lib/utils";
import {
  Crown,
  Shield,
  Users,
  ChefHat,
  Truck,
  Headphones,
  DollarSign,
  Eye,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Crown,
  Shield,
  Users,
  ChefHat,
  Truck,
  Headphones,
  DollarSign,
  Eye,
};

interface RoleHierarchyProps {
  activeRoleId?: string;
}

export function RoleHierarchy({ activeRoleId }: RoleHierarchyProps) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Role Hierarchy
      </h3>
      <div className="space-y-1">
        {ROLE_HIERARCHY.map((role, index) => {
          const indent = (role.level - 1) * 24;
          const isActive = activeRoleId === role.id;
          return (
            <div key={role.id}>
              {index > 0 && (
                <div
                  className="ml-6 border-l-2 border-dashed border-gray-200"
                  style={{ marginLeft: indent + 12 }}
                />
              )}
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "hover:bg-gray-50"
                )}
                style={{ marginLeft: indent }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(255,255,255,0.2)"
                      : `${role.color}15`,
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: isActive ? "white" : role.color,
                    }}
                  />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-white" : "text-gray-700"
                  )}
                >
                  {role.name}
                </span>
                <span
                  className={cn(
                    "ml-auto text-[10px] font-medium",
                    isActive ? "text-white/60" : "text-gray-400"
                  )}
                >
                  L{role.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
