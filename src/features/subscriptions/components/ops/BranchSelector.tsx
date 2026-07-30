"use client";

import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { branchesApi, type Branch } from "@/lib/api/master-data/branches.api";
import { useOpsBranchStore } from "@/features/subscriptions/hooks/useOpsBranch";

const statusDot: Record<string, string> = {
  OPEN: "bg-emerald-500",
  BUSY: "bg-amber-500",
  CLOSED: "bg-red-500",
  MAINTENANCE: "bg-red-400",
};

export function BranchSelector() {
  const { selectedBranchId, setSelectedBranchId } = useOpsBranchStore();
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    branchesApi
      .list({ limit: 100 })
      .then((res) => setBranches(res.data?.items ?? []))
      .catch(() => {});
  }, []);

  const activeBranches = branches.filter((b) => b.isActive);

  return (
    <Select
      value={selectedBranchId ?? "all"}
      onValueChange={(v) => setSelectedBranchId(v === "all" ? null : v)}
    >
      <SelectTrigger className="w-[220px] rounded-xl border-gray-200 bg-white text-sm font-medium">
        <SelectValue placeholder="All Branches" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
            All Branches
          </span>
        </SelectItem>
        {activeBranches.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            <span className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${statusDot[b.status] ?? "bg-gray-400"}`} />
              {b.name}
              <span className="text-xs text-muted-foreground">({b.code})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
