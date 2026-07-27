"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { X, Pencil, Loader2 } from "lucide-react";
import { branchesApi, type Branch } from "@/lib/api/master-data/branches.api";
import type { AdminTeamUser, UpdateAdminTeamUserPayload } from "@/lib/api/admin-team.api";
import { cn } from "@/lib/utils";

const ASSIGNABLE_ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "BRANCH_MANAGER", label: "Branch Manager" },
  { value: "KITCHEN_MANAGER", label: "Kitchen Manager" },
  { value: "DELIVERY_MANAGER", label: "Delivery Manager" },
  { value: "SUPPORT", label: "Support" },
  { value: "FINANCE", label: "Finance" },
];

interface EditTeamUserDialogProps {
  open: boolean;
  user: AdminTeamUser | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (userId: string, payload: UpdateAdminTeamUserPayload) => void;
}

export function EditTeamUserDialog({
  open,
  user,
  saving = false,
  onClose,
  onSave,
}: EditTeamUserDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [branchId, setBranchId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const isBranchRole = role === "BRANCH_MANAGER";

  const roleOptions = useMemo(() => {
    const options = [...ASSIGNABLE_ROLES];
    if (user?.role && !options.some((item) => item.value === user.role)) {
      options.unshift({
        value: user.role,
        label: user.role
          .split("_")
          .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
          .join(" "),
      });
    }
    return options;
  }, [user?.role]);

  useEffect(() => {
    if (!open || !user) return;
    setName(user.name || "");
    setPhone(user.phone || "");
    setRole(user.role || "");
    setBranchId(user.branch?.id || "");
    setIsActive(user.isActive);
  }, [open, user]);

  useEffect(() => {
    if (!open || !isBranchRole) return;
    setLoadingBranches(true);
    branchesApi
      .list({ limit: 100 })
      .then((res) => setBranches(res.data.data.items))
      .catch(() => toast.error("Failed to load branches"))
      .finally(() => setLoadingBranches(false));
  }, [open, isBranchRole]);

  useEffect(() => {
    if (!isBranchRole) {
      setBranchId("");
    }
  }, [isBranchRole]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (isBranchRole && !branchId) {
      toast.error("Please select a branch for Branch Manager role");
      return;
    }

    onSave(user.id, {
      name: name.trim(),
      phone: phone.trim() || null,
      role,
      branchId: isBranchRole ? branchId : null,
      isActive,
    });
  };

  if (!open || !user) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Pencil className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Edit User</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              <option value="">Select a role...</option>
              {roleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {isBranchRole && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Branch *</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                disabled={loadingBranches}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
              >
                <option value="">
                  {loadingBranches ? "Loading branches..." : "Select a branch..."}
                </option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-400"
            />
            <span className="text-sm text-gray-700">Active account</span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              )}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
