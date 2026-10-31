"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ORDER_CANCEL_OTHER_OPTION,
  ORDER_CANCEL_REASON_OPTIONS,
  type OrderCancelReasonOption,
} from "../constants/order-cancel-reasons";

type OrderCancelReasonFormProps = {
  selected: OrderCancelReasonOption | null;
  onSelectedChange: (value: OrderCancelReasonOption) => void;
  otherText: string;
  onOtherTextChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
};

export function OrderCancelReasonForm({
  selected,
  onSelectedChange,
  otherText,
  onOtherTextChange,
  idPrefix = "order-cancel",
  className,
}: OrderCancelReasonFormProps) {
  const otherId = `${idPrefix}-other`;

  return (
    <div className={cn("space-y-3", className)}>
      <Label>Select reason</Label>
      <ul className="max-h-[min(40vh,280px)] space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
        {ORDER_CANCEL_REASON_OPTIONS.map((option) => {
          const inputId = `${idPrefix}-${option.replace(/\W+/g, "-")}`;
          const isSelected = selected === option;
          return (
            <li key={option}>
              <label
                htmlFor={inputId}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                  isSelected ? "bg-orange-50 text-gray-900" : "hover:bg-gray-50",
                )}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={`${idPrefix}-reason`}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-orange-600"
                  checked={isSelected}
                  onChange={() => onSelectedChange(option)}
                />
                <span className="leading-snug">{option}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {selected === ORDER_CANCEL_OTHER_OPTION && (
        <div className="space-y-2">
          <Label htmlFor={otherId}>Please specify</Label>
          <Textarea
            id={otherId}
            value={otherText}
            onChange={(e) => onOtherTextChange(e.target.value)}
            placeholder="Describe why this order is being cancelled"
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
