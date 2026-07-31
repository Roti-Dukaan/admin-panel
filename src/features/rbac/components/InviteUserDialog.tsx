"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, X, Send, UserPlus, Loader2 } from "lucide-react";
import { useRoleStore } from "../hooks/useRoles";
import { branchesApi, type Branch } from "@/lib/api/master-data/branches.api";
import { apiClient } from "@/lib/api/http";
import { cn } from "@/lib/utils";

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteUserDialog({ open, onClose, onSuccess }: InviteUserDialogProps) {
  const roles = useRoleStore((s) => s.roles);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedRole = roles.find((r) => r.id === roleId);
  const isBranchRole = selectedRole?.name?.toLowerCase().includes("branch manager");

  useEffect(() => {
    if (open && isBranchRole) {
      setLoadingBranches(true);
      branchesApi
        .list({ limit: 100 })
        .then((res) => {
          setBranches(res.data.data.items);
        })
        .catch(() => {
          toast.error("Failed to load branches");
        })
        .finally(() => {
          setLoadingBranches(false);
        });
    }
  }, [open, isBranchRole]);

  useEffect(() => {
    if (!isBranchRole) {
      setBranchId("");
    }
  }, [isBranchRole]);

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRoleId("");
    setBranchId("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !roleId) {
      toast.error("Please fill all required fields");
      return;
    }

    if (isBranchRole && !branchId) {
      toast.error("Please select a branch for Branch Manager role");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post("/admin/invitations", {
        email: email.trim(),
        invitedName: name.trim(),
        role: selectedRole?.name?.toUpperCase().replace(/\s+/g, "_") || "BRANCH_MANAGER",
        branchId: isBranchRole ? branchId : undefined,
      });

      toast.success(`Invitation sent to ${email}`, {
        description: `Role: ${selectedRole?.name || "Unknown"}${isBranchRole ? ` | Branch: ${branches.find((b) => b.id === branchId)?.name || ""}` : ""}`,
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to send invitation";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <UserPlus className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Invite New User
              </h3>
              <p className="text-xs text-gray-500">
                Send an invitation to join the admin portal
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Arjun Mehta"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun@rotidukaan.com"
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Assign Role *
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              <option value="">Select a role...</option>
              {roles
                .filter((r) => r.status === "active")
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} {role.isSystem ? "(System)" : "(Custom)"}
                  </option>
                ))}
            </select>
          </div>

          {isBranchRole && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Assign Branch *
              </label>
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

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs text-blue-700">
              An invitation email will be sent with a link to join the admin portal.
              They can sign in anytime using a one-time code sent to their email — no
              password setup required.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {saving ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
