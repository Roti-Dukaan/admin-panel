"use client";

import { useMemo, useState } from "react";
import { RBACUser } from "../types/role";
import { useRoleStore } from "../hooks/useRoles";
import { Search, UserMinus, Mail, Phone, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignUsersProps {
  roleId: string;
  assignedUserIds: string[];
  onUpdate?: (userIds: string[]) => void;
  readonly?: boolean;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AssignUsers({
  roleId,
  assignedUserIds,
  onUpdate,
  readonly = false,
}: AssignUsersProps) {
  const users = useRoleStore((s) => s.users);
  const [search, setSearch] = useState("");

  const assignedUsers = useMemo(
    () => users.filter((u) => assignedUserIds.includes(u.id)),
    [users, assignedUserIds]
  );

  const availableUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => !assignedUserIds.includes(u.id))
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)
      );
  }, [users, assignedUserIds, search]);

  const handleAssign = (userId: string) => {
    if (readonly || !onUpdate) return;
    onUpdate([...assignedUserIds, userId]);
  };

  const handleRemove = (userId: string) => {
    if (readonly || !onUpdate) return;
    onUpdate(assignedUserIds.filter((id) => id !== userId));
  };

  return (
    <div className="space-y-5">
      {/* Assigned Users */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Assigned Users ({assignedUsers.length})
        </h4>
        {assignedUsers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-400">No users assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-gray-200/80 bg-white p-3 transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDate(user.lastLogin)}
                      </span>
                    </div>
                  </div>
                </div>
                {!readonly && (
                  <button
                    onClick={() => handleRemove(user.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <UserMinus className="h-3 w-3" />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Users */}
      {!readonly && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Available Users
          </h4>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">
                No available users found
              </p>
            ) : (
              availableUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(user.id)}
                    className="rounded-md bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white hover:bg-gray-800 transition-colors"
                  >
                    Assign
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
