"use client";

import { cn } from "@/lib/utils";
import {
  format12PartsTo24,
  formatDeliverySlotTime,
  HOURS_12,
  MINUTES,
  parseTime24To12,
  PERIODS,
  type Time12Parts,
} from "@/lib/delivery-slot-display";

type DeliverySlotTimeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

const selectCls =
  "rounded-xl border border-gray-200 bg-white px-2 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60";

function partsFromValue(value: string): Time12Parts | null {
  if (!value) return null;
  return parseTime24To12(value);
}

export function DeliverySlotTimeInput({
  value,
  onChange,
  disabled = false,
  className,
}: DeliverySlotTimeInputProps) {
  if (disabled) {
    return (
      <p
        className={cn(
          "rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900",
          className,
        )}
      >
        {value ? formatDeliverySlotTime(value) : "—"}
      </p>
    );
  }

  const parts = partsFromValue(value) ?? { hour: 12, minute: 0, period: "AM" as const };
  const hasValue = Boolean(value);

  const update = (patch: Partial<Time12Parts>) => {
    onChange(format12PartsTo24({ ...parts, ...patch }));
  };

  return (
    <div className={cn("grid w-full max-w-md grid-cols-[1fr_auto_1fr_1fr] items-center gap-2", className)}>
      <select
        value={hasValue ? parts.hour : ""}
        onChange={(e) => {
          const hour = Number(e.target.value);
          if (!hasValue) {
            onChange(format12PartsTo24({ hour, minute: 0, period: "AM" }));
            return;
          }
          update({ hour });
        }}
        className={cn(selectCls, "min-w-0 w-full")}
        aria-label="Hour"
      >
        {!hasValue && (
          <option value="" disabled>
            Hour
          </option>
        )}
        {HOURS_12.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span className="text-center text-sm font-semibold text-gray-400">:</span>
      <select
        value={parts.minute}
        onChange={(e) => update({ minute: Number(e.target.value) })}
        className={cn(selectCls, "min-w-0 w-full")}
        aria-label="Minute"
        disabled={!hasValue}
      >
        {MINUTES.map((minute) => (
          <option key={minute} value={minute}>
            {String(minute).padStart(2, "0")}
          </option>
        ))}
      </select>
      <select
        value={parts.period}
        onChange={(e) => update({ period: e.target.value as "AM" | "PM" })}
        className={cn(selectCls, "min-w-0 w-full font-semibold")}
        aria-label="AM or PM"
        disabled={!hasValue}
      >
        {PERIODS.map((period) => (
          <option key={period} value={period}>
            {period}
          </option>
        ))}
      </select>
    </div>
  );
}
