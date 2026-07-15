import { Avatar } from "@/components/ui/avatar"
import type { Customer } from "../types/order"

interface CustomerCardProps {
  customer: Customer | undefined
}

export function CustomerCard({ customer }: CustomerCardProps) {
  if (!customer) {
    return (
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h4 className="text-sm font-semibold">Customer</h4>
        <p className="text-sm text-muted-foreground">—</p>
      </div>
    )
  }
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
    </div>
  )
}
