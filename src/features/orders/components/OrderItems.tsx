import { cn } from "@/lib/utils"
import type { OrderItem } from "../types/order"

function formatCurrency(amount: number) {
  const safe = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(safe)
}

interface OrderItemsProps {
  items: OrderItem[]
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold mb-3">Items Ordered</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border p-3"
          >
            {item.foodImage ? (
              <img
                src={item.foodImage}
                alt={item.foodName}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-lg">
                🍛
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.foodName}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </p>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(item.total)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
