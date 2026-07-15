"use client";

import { Zap, Clock3, CreditCard, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeliveryKind, PaymentFilter, PrepTimeFilter } from "../types/kitchen";

function Chip({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
        active
          ? "border-orange-300 bg-orange-50 text-orange-700"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export function QuickFilters({
  deliveryKind,
  onDeliveryKind,
  payment,
  onPayment,
  prepTime,
  onPrepTime,
}: {
  deliveryKind: DeliveryKind | "all";
  onDeliveryKind: (value: DeliveryKind | "all") => void;
  payment: PaymentFilter;
  onPayment: (value: PaymentFilter) => void;
  prepTime: PrepTimeFilter;
  onPrepTime: (value: PrepTimeFilter) => void;
}) {
  const toggleDelivery = () =>
    onDeliveryKind(deliveryKind === "quick" ? "all" : "quick");
  const toggleScheduled = () =>
    onDeliveryKind(deliveryKind === "scheduled" ? "all" : "scheduled");
  const togglePaid = () => onPayment(payment === "paid" ? "all" : "paid");
  const toggleCod = () => onPayment(payment === "cod" ? "all" : "cod");
  const togglePrep = () =>
    onPrepTime(prepTime === "oldest" ? "newest" : "oldest");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip active={deliveryKind === "quick"} onClick={toggleDelivery} icon={Zap} label="Quick" />
      <Chip active={deliveryKind === "scheduled"} onClick={toggleScheduled} icon={Clock3} label="Scheduled" />
      <Chip active={payment === "paid"} onClick={togglePaid} icon={IndianRupee} label="Paid" />
      <Chip active={payment === "cod"} onClick={toggleCod} icon={CreditCard} label="COD" />
      <Chip
        active={prepTime === "oldest"}
        onClick={togglePrep}
        icon={Clock3}
        label={prepTime === "oldest" ? "Oldest" : "Newest"}
      />
    </div>
  );
}
