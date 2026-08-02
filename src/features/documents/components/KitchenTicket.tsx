import type { KitchenTicketData } from "../types/document";
import { DocumentBrandHeader } from "./DocumentBrandHeader";

export function KitchenTicket({ data }: { data: KitchenTicketData }) {
  return (
    <article
      id="thermal-print-content"
      className="thermal-label-paper thermal-label-print-root"
      aria-label="Kitchen Ticket"
    >
      <DocumentBrandHeader subtitle="Kitchen Ticket" />
      <div className="thermal-divider" />

      <div className="thermal-section-title">Order Information</div>
      <div className="thermal-row">
        <strong>Order ID:</strong> {data.orderNumber}
      </div>
      <div className="thermal-row">
        <strong>Order Type:</strong> {data.orderType}
      </div>
      <div className="thermal-row">
        <strong>Order Date:</strong> {data.orderDate}
      </div>
      <div className="thermal-row">
        <strong>Order Time:</strong> {data.orderTime}
      </div>
      <div className="thermal-row">
        <strong>Delivery Type:</strong> {data.deliveryType}
      </div>
      <div className="thermal-row">
        <strong>Delivery Slot:</strong> {data.deliverySlot}
      </div>
      <div className="thermal-row">
        <strong>Items:</strong> {data.itemCount}
      </div>
      <div className="thermal-row">
        <strong>Payment:</strong> {data.paymentMethod}
      </div>

      <div className="thermal-divider" />
      <div className="thermal-section-title">Customer</div>
      <div className="thermal-row font-semibold">{data.customerName}</div>
      <div className="thermal-row">{data.customerPhone}</div>

      <div className="thermal-divider" />
      <div className="thermal-section-title">Items</div>
      <ul className="thermal-items-list">
        {data.items.map((item) => (
          <li key={item.lineNumber} className="thermal-row">
            <div className="flex items-start gap-1">
              <span>☐</span>
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="thermal-row-compact text-gray-700">
                  {item.variant} · <span className="thermal-qty">Qty {item.quantity}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {data.specialInstructions && data.specialInstructions.length > 0 ? (
        <>
          <div className="thermal-divider" />
          <div className="thermal-section-title">Special Instructions</div>
          <div className="thermal-row">{data.specialInstructions.join(" • ")}</div>
        </>
      ) : null}

      <div className="thermal-divider" />
      <div className="thermal-signature">Packed By ______________</div>
      <div className="thermal-signature">Checked By ______________</div>
      <div className="thermal-footer">Printed At {data.printedAt}</div>
    </article>
  );
}
