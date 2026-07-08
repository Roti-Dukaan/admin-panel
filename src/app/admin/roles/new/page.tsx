"use client";

import { RoleEditor } from "@/features/rbac/components/RoleEditor";

export default function NewRolePage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <RoleEditor mode="create" />
      </div>
    </div>
  );
}
