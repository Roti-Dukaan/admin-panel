"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, X, Send, UserPlus } from "lucide-react";
import { useRoleStore } from "../hooks/useRoles";
import { cn } from "@/lib/utils";

const inviteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  roleId: z.string().min(1, "Please select a role"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InviteUserDialog({ open, onClose }: InviteUserDialogProps) {
  const roles = useRoleStore((s) => s.roles);
  const users = useRoleStore((s) => s.users);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleId: "",
    },
  });

  if (!open) return null;

  const onSubmit = (data: InviteFormData) => {
    const exists = users.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );
    if (exists) {
      toast.error("A user with this email already exists");
      return;
    }

    toast.success(`Invitation sent to ${data.email}`, {
      description: `Role: ${roles.find((r) => r.id === data.roleId)?.name || "Unknown"}`,
    });
    reset();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
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
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Full Name *
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g., Arjun Mehta"
              className={cn(
                "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1",
                errors.name
                  ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                  : "border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              )}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                {...register("email")}
                type="email"
                placeholder="arjun@rotidukaan.com"
                className={cn(
                  "w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1",
                  errors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                )}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Phone Number *
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="+91 98765 43210"
              className={cn(
                "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1",
                errors.phone
                  ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                  : "border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              )}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Assign Role *
            </label>
            <select
              {...register("roleId")}
              className={cn(
                "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1",
                errors.roleId
                  ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                  : "border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              )}
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
            {errors.roleId && (
              <p className="mt-1 text-xs text-red-500">{errors.roleId.message}</p>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs text-blue-700">
              An email invitation will be sent with a link to set up their
              account and password.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Send className="h-4 w-4" />
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
