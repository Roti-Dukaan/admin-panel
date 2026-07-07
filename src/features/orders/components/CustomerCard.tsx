import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Customer } from "../types/order"
import { Phone, User } from "lucide-react"

interface CustomerCardProps {
  customer: Customer
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h4 className="text-sm font-semibold">Customer</h4>
      <div className="flex items-center gap-3">
        <Avatar src={customer.avatar} alt={customer.name} size="lg" />
        <div>
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-muted p-2">
          <p className="text-xs text-muted-foreground">Total Orders</p>
          <p className="font-semibold">{customer.totalOrders}</p>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <p className="text-xs text-muted-foreground">Subscription</p>
          <p className="font-semibold text-xs">{customer.subscription || "None"}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <User className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Phone className="h-3.5 w-3.5 mr-1" />
          Call
        </Button>
      </div>
    </div>
  )
}
