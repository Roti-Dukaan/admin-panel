"use client";

import { Input } from "@/components/ui/input";
import { DeliverySlotTimeInput } from "@/components/delivery/DeliverySlotTimeInput";
import { cn } from "@/lib/utils";

function splitDatetimeLocal(local: string): { date: string; time: string } {
  if (!local?.includes("T")) {
    return { date: local?.slice(0, 10) ?? "", time: "" };
  }
  const [date, timePart] = local.split("T");
  return { date, time: timePart.slice(0, 5) };
}

function combineDatetimeLocal(date: string, time24: string): string {
  if (!date.trim()) return "";
  const time = time24.trim() || "12:00";
  return `${date}T${time}`;
}

type DatetimeAmPmInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export function DatetimeAmPmInput({
  id,
  value,
  onChange,
  className,
  disabled = false,
}: DatetimeAmPmInputProps) {
  const { date, time } = splitDatetimeLocal(value);

  return (
    <div className={cn("space-y-3", className)}>
      <Input
        id={id}
        type="date"
        value={date}
        disabled={disabled}
        onChange={(e) => onChange(combineDatetimeLocal(e.target.value, time))}
      />
      <DeliverySlotTimeInput
        value={time}
        disabled={disabled || !date}
        onChange={(nextTime) => onChange(combineDatetimeLocal(date, nextTime))}
      />
    </div>
  );
}
