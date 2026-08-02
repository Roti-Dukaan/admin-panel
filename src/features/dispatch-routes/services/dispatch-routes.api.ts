import { apiClient } from "@/lib/api/http";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export type RouteStopRef = { type: "SUBSCRIPTION" | "LIVE"; id: string };

export type OptimizedRouteStop = {
  type: "SUBSCRIPTION" | "LIVE";
  id: string;
  sequence: number;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  addressText: string;
  latitude: number;
  longitude: number;
  slotId: string | null;
  slotName: string | null;
  paymentMethod: string | null;
  isCod: boolean;
  codAmount: number | null;
  distanceFromPreviousMeters: number | null;
  durationFromPreviousSeconds: number | null;
};

export type RouteOptimizationResult = {
  stops: OptimizedRouteStop[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  origin: { latitude: number; longitude: number; label: string };
  optimizedVia: "google_routes" | "nearest_neighbour";
};

export type DeliveryRouteStop = {
  id: string;
  sequence: number;
  orderType: "SUBSCRIPTION" | "LIVE";
  subscriptionDeliveryId: string | null;
  deliveryId: string | null;
  orderId: string;
  customerName: string;
  customerPhone: string | null;
  addressText: string;
  latitude: number;
  longitude: number;
  eta: string | null;
  status: string;
  distanceFromPreviousMeters: number | null;
  durationFromPreviousSeconds: number | null;
  googleMapsUrl: string;
};

export type DeliveryRoute = {
  id: string;
  routeNumber: string;
  branchId: string;
  driverId: string | null;
  driverName: string | null;
  deliverySlotId: string | null;
  deliverySlotName: string | null;
  routeType: "SELF" | "BORZO";
  status: string;
  distanceMeters: number | null;
  durationSeconds: number | null;
  totalOrders: number;
  financialYear: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  createdByName: string | null;
  stops: DeliveryRouteStop[];
};

export type DispatchReadyItem = {
  id: string;
  orderType: "SUBSCRIPTION" | "LIVE";
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  slot: { id: string; name: string } | null;
  payment: { method: string | null; isCod: boolean; codAmount: number | null };
  selectable: boolean;
};

export const dispatchRoutesApi = {
  dispatchReady: (date: string, slotId?: string): Promise<{
    date: string;
    subscriptionCount: number;
    liveCount: number;
    total: number;
    items: DispatchReadyItem[];
  }> =>
    unwrap(
      apiClient.get("/branch-manager/dispatch/dispatch-ready", {
        params: { date, slotId },
      }),
    ),

  optimize: (body: {
    stopIds: RouteStopRef[];
    date: string;
    deliverySlotId?: string;
  }): Promise<RouteOptimizationResult> =>
    unwrap(apiClient.post("/branch-manager/dispatch/optimize", body)),

  createRoute: (body: {
    date: string;
    deliverySlotId?: string;
    deliverySlotName?: string;
    routeType: "SELF" | "BORZO";
    stops: Array<{
      type: "SUBSCRIPTION" | "LIVE";
      id: string;
      sequence: number;
      latitude: number;
      longitude: number;
      distanceFromPreviousMeters?: number;
      durationFromPreviousSeconds?: number;
    }>;
    distanceMeters?: number;
    durationSeconds?: number;
  }): Promise<DeliveryRoute> =>
    unwrap(apiClient.post("/branch-manager/dispatch/routes", body)),

  getRoute: (id: string): Promise<DeliveryRoute> =>
    unwrap(apiClient.get(`/branch-manager/dispatch/routes/${id}`)),

  assignRoute: (
    id: string,
    body: { routeType: "SELF" | "BORZO"; driverId?: string; assignmentNotes?: string },
  ): Promise<{ route: DeliveryRoute; failures?: Array<{ stopId: string; error: string }> }> =>
    unwrap(apiClient.post(`/branch-manager/dispatch/routes/${id}/assign`, body)),

  routeSheetHtml: (id: string): Promise<string> =>
    apiClient
      .get(`/branch-manager/dispatch/routes/${id}/route-sheet`, { responseType: "text" })
      .then((res) => res.data as string),

  myRoutes: (date: string): Promise<DeliveryRoute[]> =>
    unwrap(apiClient.get("/delivery-boy/routes", { params: { date } })),

  startRoute: (id: string): Promise<DeliveryRoute> =>
    unwrap(apiClient.post(`/delivery-boy/routes/${id}/start`)),

  optimizeMyRoute: (date: string): Promise<RouteOptimizationResult> =>
    unwrap(apiClient.post("/delivery-boy/routes/optimize", null, { params: { date } })),

  getDriverRoute: (id: string): Promise<DeliveryRoute> =>
    unwrap(apiClient.get(`/delivery-boy/routes/${id}`)),
};
