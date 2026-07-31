"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssigneeSelectProps } from "../types/assignee-select";

export function AssigneeSelect({
  value,
  onChange,
  staff,
  placeholder = "Select driver",
  className,
  disabled,
}: AssigneeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className ?? "h-9 w-52 bg-white"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {staff.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name ?? s.email}
            {s.role === "BRANCH_MANAGER" ? " (Manager)" : " (Driver)"}
            {s.currentLoad != null && s.currentLoad > 0 ? ` · ${s.currentLoad} stops` : ""}
            {!s.active ? " · inactive" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
