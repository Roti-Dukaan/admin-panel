"use client";

import { X, Eye, Mail, Phone, Building2, Shield, Calendar, Clock } from "lucide-react";
import type { AdminTeamUser } from "@/lib/api/admin-team.api";
import { cn } from "@/lib/utils";

interface ViewTeamUserDialogProps {
  open: boolean;
  user: AdminTeamUser | null;
  onClose: () => void;
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRoleLabel(roleName: string | null) {
  if (!roleName) return "Unassigned";
  return roleName
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}

export function ViewTeamUserDialog({ open, user, onClose }: ViewTeamUserDialogProps) {
  if (!open || !user) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">User Details</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">{user.name || "Unnamed user"}</p>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              user.status === "active"
                ? "bg-green-50 text-green-700"
                : user.status === "pending"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-gray-100 text-gray-600"
            )}
          >
            {user.status === "active" ? "Active" : user.status === "pending" ? "Pending" : "Inactive"}
          </span>
        </div>

        <div className="space-y-2">
          <DetailRow icon={Mail} label="Email" value={user.email} />
          <DetailRow icon={Phone} label="Phone" value={user.phone || "Not provided"} />
          <DetailRow icon={Shield} label="Role" value={formatRoleLabel(user.role)} />
          <DetailRow
            icon={Building2}
            label="Branch"
            value={user.branch ? `${user.branch.name}${user.branch.code ? ` (${user.branch.code})` : ""}` : "Not assigned"}
          />
          <DetailRow icon={Clock} label="Last Login" value={formatDate(user.lastLogin)} />
          <DetailRow icon={Calendar} label="Invited On" value={formatDate(user.invitedAt)} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
