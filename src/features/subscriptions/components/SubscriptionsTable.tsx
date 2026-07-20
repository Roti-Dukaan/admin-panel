"use client";

import { motion } from "motion/react";
import { CalendarDays, MapPin, Clock, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubscriptionStatusBadge } from "./StatusBadge";
import { FREQUENCY_LABELS, type SubscriptionEntity } from "../types/subscription";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface SubscriptionsTableProps {
  subscriptions: SubscriptionEntity[];
  loading?: boolean;
  onSelect: (sub: SubscriptionEntity) => void;
}

export function SubscriptionsTable({ subscriptions, loading, onSelect }: SubscriptionsTableProps) {
  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-sm text-gray-400">
        Loading subscriptions…
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
        <CalendarDays className="h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-600">No subscriptions found</p>
        <p className="mt-1 text-xs text-gray-400">Try adjusting the filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Delivery</TableHead>
            <TableHead>Slot / Address</TableHead>
            <TableHead className="text-right">Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub, i) => (
            <motion.tr
              key={sub.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onSelect(sub)}
              className="cursor-pointer border-b border-border/60 transition-colors hover:bg-teal-50/50"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {sub.customer?.fullName || sub.customer?.name || "Customer"}
                    </p>
                    <p className="text-xs text-muted-foreground">{sub.customer?.phone || "—"}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium text-foreground">{sub.planName}</p>
                <p className="text-xs text-muted-foreground">Auto-renew {sub.autoRenew ? "on" : "off"}</p>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  {FREQUENCY_LABELS[sub.frequency]}
                </span>
              </TableCell>
              <TableCell>
                <SubscriptionStatusBadge status={sub.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
                  {formatDate(sub.nextOccurrenceDate)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground/70" />
                    {sub.deliverySlot?.name || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground/70" />
                    {sub.address
                      ? [sub.address.city, sub.address.pincode].filter(Boolean).join(", ") || "Address"
                      : "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right text-sm font-semibold text-foreground">{sub.quantity}</TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
