"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCustomerOrderCountLabel } from "../utils/customer-order-count";

export function CustomerOrderCountBadge({
  count,
  customerName,
  className,
}: {
  count: number;
  customerName: string;
  className?: string;
}) {
  const label = formatCustomerOrderCountLabel(count, customerName);
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-100",
        className,
      )}
    >
      <Users className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}
