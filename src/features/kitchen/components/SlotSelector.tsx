"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SlotSelector({
  slots,
  value,
  onChange,
}: {
  slots: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full sm:w-56" aria-label="Filter by delivery slot">
        <SelectValue placeholder="All Slots" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Slots</SelectItem>
        {slots.map((slot) => (
          <SelectItem key={slot} value={slot}>
            {slot}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
