import { apiClient } from "@/lib/api/http";
import type { DriverDeliveryStop } from "@/features/delivery-boys/types/delivery-boys";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export type RouteOptimizationProvider = "GOOGLE" | "MANUAL" | "NONE";
export type RouteBatchOptimizationStatus = "PENDING" | "OPTIMIZED" | "MANUAL_OVERRIDE";

export interface SubscriptionRouteBatchStop extends DriverDeliveryStop {
  routeBatchId?: string | null;
  stopAssignmentStatus?: string | null;
  stopOptimizationStatus?: string | null;
}

export interface SubscriptionRouteBatch {
  id: string;
  branchId: string;
  driverUserId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  deliveryDate: string;
  deliverySlotId: string | null;
  deliverySlotName: string | null;
  startLocation: { latitude?: number; longitude?: number; label?: string } | null;
  totalStops: number;
  totalQty: number;
  optimizationProvider: RouteOptimizationProvider;
  optimizationStatus: RouteBatchOptimizationStatus;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  createdByUserId: string;
  createdByName: string | null;
  createdAt: string;
  fullRouteUrl: string | null;
  stops: SubscriptionRouteBatchStop[];
  progress?: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
  nextStop?: SubscriptionRouteBatchStop | null;
  pendingWarning?: boolean;
}

export interface BulkAssignResult {
  assignment: {
    assignedCount: number;
    assigneeUserId: string;
    assignedToRole: string | null;
    failed?: Array<{ id: string; error: string }>;
  };
  routeBatch: SubscriptionRouteBatch | null;
}

export const subscriptionDispatchApi = {
  bulkAssign: (body: {
    deliveryIds: string[];
    assigneeUserId: string;
    date?: string;
    slotId?: string;
    assignmentNotes?: string;
    allowPartial?: boolean;
    optimize?: boolean;
  }): Promise<BulkAssignResult> =>
    unwrap(apiClient.post("/branch-manager/subscription-dispatch/bulk-assign", body)),

  assignSelf: (body: {
    deliveryIds: string[];
    date?: string;
    slotId?: string;
    assignmentNotes?: string;
    optimize?: boolean;
  }): Promise<BulkAssignResult> =>
    unwrap(apiClient.post("/branch-manager/subscription-dispatch/assign-self", body)),

  listRouteBatches: (params: {
    date: string;
    branchId?: string;
    driverId?: string;
    slotId?: string;
  }): Promise<SubscriptionRouteBatch[]> =>
    unwrap(apiClient.get("/branch-manager/subscription-dispatch/route-batches", { params })),

  getRouteBatch: (id: string): Promise<SubscriptionRouteBatch> =>
    unwrap(apiClient.get(`/branch-manager/subscription-dispatch/route-batches/${id}`)),

  optimizeRouteBatch: (id: string): Promise<SubscriptionRouteBatch> =>
    unwrap(apiClient.post(`/branch-manager/subscription-dispatch/route-batches/${id}/optimize`)),

  reorderRouteBatch: (
    id: string,
    body: {
      stops: Array<{ deliveryId: string; sequence: number }>;
      optimizationStatus?: RouteBatchOptimizationStatus;
    },
  ): Promise<SubscriptionRouteBatch> =>
    unwrap(apiClient.patch(`/branch-manager/subscription-dispatch/route-batches/${id}/reorder`, body)),

  splitRouteBatch: (
    id: string,
    body: { deliveryIds: string[]; newDriverUserId?: string },
  ): Promise<{ originalBatch: SubscriptionRouteBatch; newBatch: SubscriptionRouteBatch }> =>
    unwrap(apiClient.post(`/branch-manager/subscription-dispatch/route-batches/${id}/split`, body)),

  reassignStop: (
    batchId: string,
    deliveryId: string,
    body: { assigneeUserId: string; targetBatchId?: string },
  ): Promise<SubscriptionRouteBatch> =>
    unwrap(
      apiClient.post(
        `/branch-manager/subscription-dispatch/route-batches/${batchId}/stops/${deliveryId}/reassign`,
        body,
      ),
    ),
};

export const driverSubscriptionRouteApi = {
  listRoutes: (date: string, slot?: string): Promise<SubscriptionRouteBatch[]> =>
    unwrap(apiClient.get("/delivery-boy/subscription-route", { params: { date, slot } })),

  getRoute: (batchId: string): Promise<SubscriptionRouteBatch> =>
    unwrap(apiClient.get(`/delivery-boy/subscription-route/${batchId}`)),

  updateStopStatus: (
    id: string,
    body: {
      status: string;
      failureReason?: string;
      note?: string;
    },
  ): Promise<SubscriptionRouteBatchStop> =>
    unwrap(apiClient.patch(`/delivery-boy/subscription-stop/${id}/status`, body)),

  navigation: (id: string): Promise<{ deliveryId: string; url: string; address: string }> =>
    unwrap(apiClient.get(`/delivery-boy/subscription-stop/${id}/navigation`)),
};
