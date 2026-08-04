"use client";

import { format } from "date-fns";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Receipt,
  CreditCard,
  StickyNote,
  Truck,
  Clock,
  ChefHat,
  FileText,
  IndianRupee,
} from "lucide-react";
import { DocumentQuickAction } from "@/features/documents";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useKitchenOrderDetail } from "../hooks/useKitchen";
import { PreparationTimer } from "./PreparationTimer";
import { DeliveryStatusCard } from "./DeliveryStatusCard";
import { STAGE_META, getDeliveryKind, formatSlotWindow } from "../types/kitchen";
import type { KitchenOrderView } from "../types/kitchen";

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function KitchenOrderDrawer({
  order,
  onClose,
}: {
  order: KitchenOrderView | null;
  onClose: () => void;
}) {
  const open = !!order;
  const { data: detail, isLoading } = useKitchenOrderDetail(order?.orderId ?? null);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerHeader>
        <div>
          <DrawerTitle>{order?.orderNumber ?? "Order"}</DrawerTitle>
          {order?.ticketNumber &&
            order.ticketNumber !== order.orderNumber &&
            order.ticketNumber !== "Pending" && (
              <p className="mt-0.5 text-xs text-gray-500">{order.ticketNumber}</p>
            )}
        </div>
        <DrawerClose
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label="Close drawer"
        >
          <X className="h-5 w-5" />
        </DrawerClose>
      </DrawerHeader>

      <DrawerContent>
        {isLoading || !detail ? (
          <DetailSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Status + timer */}
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    STAGE_META[detail.kitchenStatus].pillClass
                  )}
                >
                  <span>{STAGE_META[detail.kitchenStatus].emoji}</span>
                  {detail.stageLabel}
                </span>
                <Badge variant="outline" className="capitalize">
                  {detail.priority.toLowerCase()}
                </Badge>
              </div>
              {order && <PreparationTimer order={order} now={Date.now()} />}
            </div>

            <Section icon={Package} title="Order Information">
              <Row label="Order Number" value={detail.orderNumber} />
              <Row label="Ticket Number" value={detail.ticketNumber} />
              <Row label="Created" value={format(new Date(detail.orderCreatedAt), "dd MMM yyyy, hh:mm a")} />
              <Row
                label="Started Preparing"
                value={detail.startedPreparingAt ? format(new Date(detail.startedPreparingAt), "dd MMM yyyy, hh:mm a") : "—"}
              />
              <Row
                label="Ready At"
                value={detail.readyAt ? format(new Date(detail.readyAt), "dd MMM yyyy, hh:mm a") : "—"}
              />
            </Section>

            <Section icon={User} title="Customer Information">
              <Row label="Name" value={detail.customer?.name ?? "Guest"} />
              <Row
                label="Phone"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {detail.customer?.phone ?? "—"}
                  </span>
                }
              />
              {detail.customer?.email ? (
                <Row
                  label="Email"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      {detail.customer.email}
                    </span>
                  }
                />
              ) : null}
            </Section>

            <Section icon={MapPin} title="Delivery Address">
              {detail.address ? (
                <p className="leading-relaxed text-gray-700">
                  {detail.address.addressLine1}
                  {detail.address.addressLine2 ? `, ${detail.address.addressLine2}` : ""}
                  {detail.address.landmark ? ` (${detail.address.landmark})` : ""}
                  <br />
                  {detail.address.city}, {detail.address.state} – {detail.address.pincode}
                </p>
              ) : (
                <p className="text-gray-400">No address captured.</p>
              )}
            </Section>

            <Section icon={Package} title="Items">
              <div className="space-y-2">
                {detail.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-2.5">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800">
                        {item.quantity} × {item.foodNameSnapshot}
                      </p>
                      {item.categorySnapshot ? (
                        <p className="text-xs text-gray-500">{item.categorySnapshot}</p>
                      ) : null}
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-gray-800">₹{item.lineTotal.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-500">₹{item.finalUnitPrice.toLocaleString("en-IN")} ea</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={IndianRupee} title="Pricing">
              <Row label="Subtotal" value={`₹${detail.pricing.subtotalAmount.toLocaleString("en-IN")}`} />
              <Row label="GST" value={`₹${detail.pricing.subtotalGSTAmount.toLocaleString("en-IN")}`} />
              <Row label="Delivery Charge" value={`₹${detail.pricing.deliveryCharge.toLocaleString("en-IN")}`} />
              {detail.pricing.discountAmount > 0 && (
                <Row label="Discount" value={`− ₹${detail.pricing.discountAmount.toLocaleString("en-IN")}`} />
              )}
              <div className="mt-1 border-t border-gray-200 pt-2">
                <Row label="Grand Total" value={`₹${detail.pricing.grandTotal.toLocaleString("en-IN")}`} />
              </div>
            </Section>

            <Section icon={Receipt} title="Taxes">
              <div className="space-y-1">
                {detail.taxes.lines.map((line, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-gray-600">
                      {line.foodNameSnapshot}
                      {line.hsnCode ? <span className="text-gray-400"> · HSN {line.hsnCode}</span> : null}
                    </span>
                    <span className="shrink-0 text-gray-500">
                      {line.gstPercentage}% {line.gstType}
                    </span>
                    <span className="shrink-0 font-medium text-gray-700">
                      ₹{line.lineGSTAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-gray-200 pt-1 text-sm">
                  <span className="font-semibold text-gray-700">Total GST</span>
                  <span className="font-semibold text-gray-800">
                    ₹{detail.taxes.totalGSTAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </Section>

            <Section icon={FileText} title="Invoice">
              <Row label="Invoice Number" value={detail.invoice?.invoiceNumber ?? "—"} />
              <Row label="Status" value={detail.invoice?.status ?? "—"} />
              {detail.invoice?.pdfUrl ? (
                <a
                  href={detail.invoice.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Invoice
                </a>
              ) : null}
            </Section>

            {order?.orderId ? (
              <div className="pt-2">
                <DocumentQuickAction
                  orderId={order.orderId}
                  documentType="KITCHEN_TICKET"
                  label="Print Kitchen Ticket"
                  icon={ChefHat}
                />
              </div>
            ) : null}

            <Section icon={CreditCard} title="Payment Information">
              <Row label="Method" value={detail.payment?.paymentMethod?.toUpperCase() ?? "—"} />
              <Row label="Status" value={detail.payment?.status ?? "—"} />
              {detail.payment?.paymentReference ? (
                <Row label="Reference" value={detail.payment.paymentReference} />
              ) : null}
              {detail.payment?.amount != null ? (
                <Row label="Amount" value={`₹${detail.payment.amount.toLocaleString("en-IN")}`} />
              ) : null}
            </Section>

            <Section icon={StickyNote} title="Order Notes">
              <p className="text-gray-700">{detail.specialInstructions || "No special instructions."}</p>
            </Section>

            <Section icon={Truck} title="Delivery Type">
              <Row
                label="Fulfilment"
                value={
                  <span className="inline-flex items-center gap-1">
                    {getDeliveryKind(order as KitchenOrderView) === "scheduled" ? (
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                    ) : (
                      <Truck className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    {detail.deliveryType}
                  </span>
                }
              />
              <Row
                label="Slot"
                value={
                  detail.deliverySlot
                    ? `${detail.deliverySlot.name} (${formatSlotWindow(detail.deliverySlot)})`
                    : "Quick Delivery (30–45 mins)"
                }
              />
            </Section>

            <Section icon={ChefHat} title="Preparation Timeline">
              <ol className="space-y-2">
                {detail.timeline.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gray-300" />
                    <div className="text-xs">
                      <p className="font-medium text-gray-700">{entry.status}</p>
                      <p className="text-gray-400">
                        {format(new Date(entry.createdAt), "dd MMM yyyy, hh:mm a")} · {entry.createdByType}
                      </p>
                      {entry.remarks ? <p className="text-gray-500">{entry.remarks}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            {/* Delivery status — live rider arrival + pickup for QUICK orders */}
            {detail.delivery && (
              <Section icon={Truck} title="Delivery">
                <DeliveryStatusCard delivery={detail.delivery} />
              </Section>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
