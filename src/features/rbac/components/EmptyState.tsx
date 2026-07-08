"use client";

import { Shield, Plus } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
        <Shield className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        No Roles Available
      </h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
        Create your first role to start managing permissions and access
        control for your admin portal.
      </p>
      <Link
        href="/admin/roles/new"
        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Create Your First Role
      </Link>
    </div>
  );
}
