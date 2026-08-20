"use client"

import { useState } from "react"
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { OrderTimeline } from "./OrderTimeline"
import { OrderItems } from "./OrderItems"
import { CustomerCard } from "./CustomerCard"
import { PaymentCard } from "./PaymentCard"
import { DeliveryCard } from "./DeliveryCard"
import { StatusBadge } from "./StatusBadge"
import { InvoiceCard } from "./InvoiceCard"
import { useOrdersStore } from "../hooks/useOrders"
import { toast } from "sonner"
import type { OrderStatus } from "../types/order"
import {
  NEXT_ORDER_STATUS,
  STATUS_ACTION_LABELS,
  normalizeOrderStatus,
  canCancelOrder,
} from "../utils/status"
import { RefreshCw, ExternalLink, Truck } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { deliveryApi } from "@/features/delivery/services/delivery.api"
import { branchDeliveryApi } from "@/features/delivery/services/branch-delivery.api"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { DeliveryStatusBadge } from "@/features/delivery/components/DeliveryStatusBadge"
import { DeliveryInformation } from "@/features/orders/delivery/DeliveryInformation"
import { DeliveryTimeline } from "@/features/orders/delivery/DeliveryTimeline"

export function OrderDrawer() {
  const { isBranchManager } = useWorkspace()
  const { selectedOrder, drawerOpen, setDrawerOpen, setSelectedOrder, updateOrderStatus, cancelOrder, updatingStatus } = useOrdersStore()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("Test order / cancelled by admin")

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
    if (!selectedOrder || !cancelReason.trim()) return
    try {
      await cancelOrder(selectedOrder.id, cancelReason.trim())
      toast.success("Order cancelled")
      setShowCancelDialog(false)
      handleClose()
    } catch {
      toast.error("Failed to cancel order")
    }
  }

  const currentStatus = selectedOrder
    ? normalizeOrderStatus(selectedOrder.status)
    : undefined
  const nextStatus = currentStatus ? NEXT_ORDER_STATUS[currentStatus] : undefined
  const showCancel = currentStatus ? canCancelOrder(currentStatus) : false

  const { data: deliveryTracking, isLoading: deliveryLoading } = useQuery({
    queryKey: ["order-delivery", selectedOrder?.id, isBranchManager],
    queryFn: () =>
      isBranchManager
        ? branchDeliveryApi.getByOrderId(selectedOrder!.id)
        : deliveryApi.getByOrderId(selectedOrder!.id),
    enabled: !!selectedOrder?.id,
  })

  const [showTimeline, setShowTimeline] = useState(false)

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
            <CustomerCard
              customer={selectedOrder.customer}
              receiverName={deliveryTracking?.order?.address?.customerName}
              receiverPhone={deliveryTracking?.order?.address?.phoneNumber}
            />

            <DeliveryCard delivery={selectedOrder.delivery} />

            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Truck className="h-4 w-4 text-gray-500" />
                  Delivery Status
                </h3>
                {deliveryTracking && (
                  <DeliveryStatusBadge status={deliveryTracking.status} size="sm" />
                )}
              </div>

              {deliveryLoading ? (
                <p className="text-sm text-muted-foreground">Loading delivery…</p>
              ) : deliveryTracking ? (
                <div className="space-y-3">
                  <DeliveryInformation
                    delivery={deliveryTracking}
                    onViewTimeline={() => setShowTimeline((v) => !v)}
                  />

                  {showTimeline && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <p className="mb-3 text-sm font-semibold text-gray-700">Delivery Timeline</p>
                      <DeliveryTimeline
                        entries={deliveryTracking.timeline ?? []}
                        currentStatus={deliveryTracking.status}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No delivery has been created for this order yet.
                </p>
              )}
            </div>

            <PaymentCard payment={selectedOrder.payment} />

            <InvoiceCard orderId={selectedOrder.id} />

            <Separator />

            <OrderItems items={selectedOrder.items} />

            <Separator />

            <OrderTimeline
              timeline={selectedOrder.timeline}
              currentStatus={currentStatus ?? selectedOrder.status}
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
              {showCancel && (
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={updatingStatus === selectedOrder.id}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </DrawerFooter>
        </div>
      )}

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              This removes the order from the kitchen queue and marks it cancelled. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="order-cancel-reason">Reason</Label>
            <Textarea
              id="order-cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Test order, customer requested cancellation"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={updatingStatus === selectedOrder?.id}>
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleCancel()}
              disabled={!cancelReason.trim() || updatingStatus === selectedOrder?.id}
            >
              {updatingStatus === selectedOrder?.id ? "Cancelling…" : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Drawer>
  )
}
