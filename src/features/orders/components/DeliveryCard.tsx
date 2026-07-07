import type { DeliveryInfo } from "../types/order"
import { MapPin, Calendar, Clock, MessageSquare } from "lucide-react"

interface DeliveryCardProps {
  delivery: DeliveryInfo
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h4 className="text-sm font-semibold">Delivery</h4>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm">{delivery.address}</p>
            {delivery.pincode && (
              <p className="text-xs text-muted-foreground">Pincode: {delivery.pincode}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{delivery.date}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{delivery.slot}</span>
        </div>

        {delivery.instructions && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground italic">{delivery.instructions}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-muted/50 border border-dashed border-border p-4 text-center">
        <MapPin className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
        <p className="text-xs text-muted-foreground">Google Maps Preview</p>
      </div>
    </div>
  )
}
