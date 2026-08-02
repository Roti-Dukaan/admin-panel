import type { DeliveryLabelData } from "../types/document";
import { DocumentBrandHeader } from "./DocumentBrandHeader";

export function DeliveryLabel({ data }: { data: DeliveryLabelData }) {
  return (
    <article
      id="thermal-print-content"
      className="thermal-label-paper thermal-label-print-root"
      aria-label="Delivery Label"
    >
      <DocumentBrandHeader subtitle="Delivery Label" />
      <div className="thermal-divider" />

      <div className="thermal-section-title">Order</div>
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
        <strong>Items:</strong> {data.itemCount}
      </div>
      <div className="thermal-row">
        <strong>Order Total:</strong> ₹{Number(data.grandTotal).toLocaleString("en-IN")}
      </div>
      {data.branchName ? (
        <div className="thermal-row">
          <strong>Branch:</strong> {data.branchName}
        </div>
      ) : null}

      <div className="thermal-divider" />
      <div className="thermal-section-title">Customer</div>
      <div className="thermal-row font-semibold">{data.customerName}</div>
      <div className="thermal-row">{data.customerPhone}</div>

      <div className="thermal-divider" />
      <div className="thermal-section-title">Delivery Address</div>
      <div className="thermal-row">{data.deliveryAddress}</div>

      <div className="thermal-divider" />
      <div className="thermal-section-title">Delivery Slot</div>
      <div className="thermal-row">{data.deliverySlot}</div>

      <div className="thermal-divider" />
      <div className="thermal-section-title">Items Summary</div>
      {data.itemsSummary.map((line, i) => (
        <div key={i} className="thermal-row-compact">
          {line}
        </div>
      ))}

      <div className="thermal-divider" />
      <div className="thermal-section-title">Payment</div>
      <div className="thermal-row">
        <strong>Method:</strong> {data.paymentMethod}
      </div>
      {data.paymentStatus === "PAID" ? (
        <div className="thermal-badge">PAID</div>
      ) : (
        <div className="thermal-badge thermal-badge-cod">
          CASH ON DELIVERY
          <div className="mt-0.5 text-[9px]">
            Collect ₹{Number(data.collectAmount ?? 0).toLocaleString("en-IN")}
          </div>
        </div>
      )}

      <div className="thermal-signature mt-1">Driver _____________</div>
      <div className="thermal-signature">Route _____________</div>
      <div className="thermal-footer">Printed At {data.printedAt}</div>
    </article>
  );
}
