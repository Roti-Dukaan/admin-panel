import type { AdminDeliveryInfo } from "../types/order"
import { Calendar, Clock } from "lucide-react"

interface DeliveryCardProps {
  delivery: AdminDeliveryInfo | undefined
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  if (!delivery) {
    return (
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h4 className="text-sm font-semibold">Delivery</h4>
        <p className="text-sm text-muted-foreground">—</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h4 className="text-sm font-semibold">Delivery</h4>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{delivery.date}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{delivery.slot}</span>
        </div>
      </div>
    </div>
  )
}
