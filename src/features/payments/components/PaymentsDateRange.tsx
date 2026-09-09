"use client";

import { useEffect, useRef } from "react";
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/DateRangeFilter";
import { usePaymentStore } from "../hooks/usePayments";
import type { DateFilter, PaymentFilters } from "../types/payment";

function toDateRangeValue(filters: PaymentFilters): DateRangeValue {
  const presetMap: Record<DateFilter, DateRangeValue["preset"]> = {
    today: "today",
    yesterday: "yesterday",
    last_7_days: "7d",
    last_30_days: "30d",
    this_month: "this-month",
    custom: "custom",
  };

  return {
    preset: presetMap[filters.dateFilter] ?? "30d",
    startDate: filters.customDateFrom,
    endDate: filters.customDateTo,
  };
}

export function PaymentsDateRange() {
  const filters = usePaymentStore((s) => s.filters);
  const setDateRange = usePaymentStore((s) => s.setDateRange);
  const refresh = usePaymentStore((s) => s.refresh);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      refresh();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.dateFilter, filters.customDateFrom, filters.customDateTo, refresh]);

  const handleChange = (value: DateRangeValue) => {
    setDateRange(value.preset, value.startDate || "", value.endDate || "");
  };

  return (
    <div className="flex justify-end">
      <DateRangeFilter value={toDateRangeValue(filters)} onChange={handleChange} />
    </div>
  );
}
