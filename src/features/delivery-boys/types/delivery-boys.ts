export type DeliveryBoyAvailability = "AVAILABLE" | "BUSY" | "OFFLINE";

export interface DeliveryBoy {
  id: string;
  name: string | null;
  phone: string | null;
  email: string;
  role: string;
  branchId: string | null;
  active: boolean;
  availabilityStatus: DeliveryBoyAvailability;
  vehicleType: string | null;
  notes: string | null;
  roles: string[];
}

export interface AssignableStaff extends DeliveryBoy {
  role: string;
  currentLoad?: number;
  isSelf?: boolean;
}

export interface DriverDeliveryStop {
  id: string;
  deliveryNumber?: string;
  subscriptionNumber?: string;
  routeSequence: number | null;
  customerName: string;
  customerPhone: string;
  address: string;
  slot: {
    id?: string;
    name: string | null;
    startTime?: string | null;
    endTime?: string | null;
  };
  items: Array<{ name: string; rotiType: string | null; quantity: number }>;
  totalQuantity: number;
  notes: string | null;
  deliveryNote: string | null;
  failureReason: string | null;
  status: string;
  prepStatus?: string;
  dispatchStatus: string;
  assignmentStatus?: string;
  googleMapsUrl: string;
  navigationTarget?: "branch" | "customer";
  branchName?: string | null;
  branchAddress?: string | null;
  branchGoogleMapsUrl?: string | null;
  arrivedAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  assignedToUserId?: string | null;
  assignedToRole?: string | null;
  assignedByUserId?: string | null;
  assignedAt?: string | null;
  assignmentNotes?: string | null;
  assigneeName?: string | null;
  assignedByName?: string | null;
  canAssign?: boolean;
  canUnassign?: boolean;
  canReassign?: boolean;
}

export interface DriverRouteResponse {
  date: string;
  progress: {
    assigned: number;
    completed: number;
    pending: number;
    failed: number;
  };
  nextStop: DriverDeliveryStop | null;
  stops: DriverDeliveryStop[];
  pendingWarning?: boolean;
  canCompleteRoute?: boolean;
}

export interface CreateDeliveryBoyInput {
  name: string;
  phone: string;
  email: string;
  availabilityStatus?: DeliveryBoyAvailability;
  vehicleType?: string;
  notes?: string;
}

export interface UpdateDeliveryBoyInput extends Partial<CreateDeliveryBoyInput> {
  active?: boolean;
}

export const AVAILABILITY_LABELS: Record<DeliveryBoyAvailability, string> = {
  AVAILABLE: "Available",
  BUSY: "Busy",
  OFFLINE: "Offline",
};

export const PREP_STATUS_LABELS: Record<string, string> = {
  PACKED: "Packed",
  READY: "Dispatch ready",
  PREPARING: "Preparing",
  DELIVERED: "Delivered",
};

export const DISPATCH_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  UNASSIGNED: { label: "Unassigned", className: "bg-gray-100 text-gray-700" },
  ASSIGNED: { label: "Assigned", className: "bg-blue-100 text-blue-700" },
  ARRIVED: { label: "Arrived", className: "bg-amber-100 text-amber-800" },
  DELIVERED: { label: "Delivered", className: "bg-emerald-100 text-emerald-800" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
};
