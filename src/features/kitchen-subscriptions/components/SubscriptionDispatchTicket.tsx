import { format } from "date-fns";
import { formatDeliverySlotLabel } from "@/lib/delivery-slot-display";
import { DocumentBrandHeader } from "@/features/documents/components/DocumentBrandHeader";
import type { SubscriptionPrepRow } from "../types/kitchen-subscriptions";
import { ROTI_TYPE_LABELS } from "../types/kitchen-subscriptions";

export function SubscriptionDispatchTicket({ row }: { row: SubscriptionPrepRow }) {
  const deliveryDate = row.deliveryDate
    ? format(new Date(row.deliveryDate), "dd MMM yyyy")
    : "—";
  const slotLabel =
    row.deliverySlotStart && row.deliverySlotEnd
      ? formatDeliverySlotLabel(row.deliverySlotStart, row.deliverySlotEnd)
      : null;

  return (
    <article
      id="subscription-dispatch-ticket"
      className="thermal-label-paper thermal-label-print-root"
      aria-label="Subscription Dispatch Ticket"
    >
      <DocumentBrandHeader subtitle="Dispatch Ticket" />

      <div className="thermal-divider" />
      <div className="thermal-section-title">Subscription Delivery</div>
      <div className="thermal-row">
        <strong>Delivery ID:</strong> {row.id.slice(0, 8).toUpperCase()}
      </div>
      {row.orderNumber ? (
        <div className="thermal-row">
          <strong>Order ID:</strong> {row.orderNumber}
        </div>
      ) : null}
      <div className="thermal-row">
        <strong>Delivery Date:</strong> {deliveryDate}
      </div>
      {row.planName ? (
        <div className="thermal-row">
          <strong>Plan:</strong> {row.planName}
        </div>
      ) : null}

      <div className="thermal-divider" />
      <div className="thermal-section-title">Customer</div>
      <div className="thermal-row font-semibold">{row.customerName}</div>
      <div className="thermal-row">{row.customerPhone || "—"}</div>

      <div className="thermal-divider" />
      <div className="thermal-section-title">Delivery Address</div>
      <div className="thermal-row">{row.area || "—"}</div>
      <div className="thermal-row">{row.address || "—"}</div>

      <div className="thermal-divider" />
      <div className="thermal-section-title">Delivery Slot</div>
      <div className="thermal-row">{row.deliverySlotName ?? "—"}</div>
      {slotLabel ? <div className="thermal-row-compact">{slotLabel}</div> : null}

      <div className="thermal-divider" />
      <div className="thermal-section-title">Items ({row.totalQuantity})</div>
      {row.selectedRotis.map((item, idx) => (
        <div key={`${item.name}-${idx}`} className="thermal-row-compact">
          {item.quantity} × {item.name}
          {item.rotiType ? ` (${ROTI_TYPE_LABELS[item.rotiType] ?? item.rotiType})` : ""}
        </div>
      ))}

      {row.notes ? (
        <>
          <div className="thermal-divider" />
          <div className="thermal-section-title">Notes</div>
          <div className="thermal-row">{row.notes}</div>
        </>
      ) : null}

      <div className="thermal-divider" />
      <div className="thermal-badge">SUBSCRIPTION · PREPAID</div>
      <div className="thermal-signature mt-1">Packed By _____________</div>
      <div className="thermal-signature">Driver _____________</div>
      <div className="thermal-footer">
        Printed {format(new Date(), "dd MMM yyyy, hh:mm a")}
      </div>
    </article>
  );
}
