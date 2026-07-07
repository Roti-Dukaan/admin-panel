"use client"

import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderTimeline } from "./OrderTimeline"
import { OrderItems } from "./OrderItems"
import { CustomerCard } from "./CustomerCard"
import { PaymentCard } from "./PaymentCard"
import { DeliveryCard } from "./DeliveryCard"
import { StatusBadge } from "./StatusBadge"
import { useOrdersStore } from "../hooks/useOrders"
import { toast } from "sonner"
import type { OrderStatus } from "../types/order"
import { RefreshCw } from "lucide-react"

const NEXT_STATUS_MAP: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "packed",
  packed: "out_for_delivery",
  out_for_delivery: "delivered",
}

const STATUS_ACTION_LABELS: Record<string, string> = {
  accepted: "Accept Order",
  preparing: "Start Preparing",
  packed: "Mark Packed",
  out_for_delivery: "Mark Out For Delivery",
  delivered: "Mark Delivered",
}

export function OrderDrawer() {
  const { selectedOrder, drawerOpen, setDrawerOpen, setSelectedOrder, updateOrderStatus, cancelOrder, updatingStatus } = useOrdersStore()

  const handleClose = () => {
    setDrawerOpen(false)
    setSelectedOrder(null)
  }

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!selectedOrder) return
    try {
      await updateOrderStatus(selectedOrder.id, status)
      toast.success(`Order marked as ${STATUS_ACTION_LABELS[status] || status}`)
    } catch {
      toast.error("Failed to update order status")
    }
  }

  const handleCancel = async () => {
    if (!selectedOrder) return
    try {
      await cancelOrder(selectedOrder.id)
      toast.success("Order cancelled")
    } catch {
      toast.error("Failed to cancel order")
    }
  }

  const nextStatus = selectedOrder ? NEXT_STATUS_MAP[selectedOrder.status] : undefined

  return (
    <Drawer open={drawerOpen} onOpenChange={handleClose}>
      {selectedOrder && (
        <div className="flex h-full flex-col">
          <DrawerHeader>
            <div className="flex items-center gap-3">
              <DrawerTitle>{selectedOrder.orderNumber}</DrawerTitle>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <DrawerClose onClick={handleClose} />
          </DrawerHeader>

          <DrawerContent className="space-y-6">
            <CustomerCard customer={selectedOrder.customer} />

            <DeliveryCard delivery={selectedOrder.delivery} />

            <PaymentCard payment={selectedOrder.payment} />

            <Separator />

            <OrderItems items={selectedOrder.items} />

            <Separator />

            <OrderTimeline
              timeline={selectedOrder.timeline}
              currentStatus={selectedOrder.status}
            />
          </DrawerContent>

          <DrawerFooter>
            <div className="flex flex-wrap gap-2">
              {nextStatus && (
                <Button
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={updatingStatus === selectedOrder.id}
                >
                  {updatingStatus === selectedOrder.id ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : null}
                  {STATUS_ACTION_LABELS[nextStatus]}
                </Button>
              )}
              {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={updatingStatus === selectedOrder.id}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </DrawerFooter>
        </div>
      )}
    </Drawer>
  )
}
