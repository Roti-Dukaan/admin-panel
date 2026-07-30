"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { branchesApi, type Branch } from "@/lib/api/master-data/branches.api";

interface DeliveryBranchFilterProps {
  value?: string;
  onChange: (branchId: string | undefined) => void;
  className?: string;
}

export function DeliveryBranchFilter({ value, onChange, className }: DeliveryBranchFilterProps) {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    branchesApi
      .list({ limit: 100 })
      .then((res) => setBranches(res.data?.data?.items ?? []))
      .catch(() => setBranches([]));
  }, []);

  const activeBranches = branches.filter((b) => b.isActive);

  return (
    <Select
      value={value ?? "all"}
      onValueChange={(v) => onChange(v === "all" ? undefined : v)}
    >
      <SelectTrigger className={className ?? "w-[200px]"}>
        <SelectValue placeholder="All Branches" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Branches</SelectItem>
        {activeBranches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name} ({branch.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
