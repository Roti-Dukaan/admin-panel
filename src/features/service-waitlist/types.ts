export type ServiceWaitlistStatus = "WAITING" | "NOTIFIED";

export interface ServiceWaitlistEntry {
  id: string;
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  latitude: number;
  longitude: number;
  formattedAddress: string | null;
  city: string | null;
  status: ServiceWaitlistStatus;
  notifiedAt: string | null;
  notifiedBranchId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceWaitlistFilters {
  page: number;
  limit: number;
  status: ServiceWaitlistStatus | "all";
  search: string;
}

export interface ServiceWaitlistListResponse {
  items: ServiceWaitlistEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  waitingCount: number;
}

export interface NotifyServiceableResult {
  checked: number;
  notifiedEntries: number;
  notifiedCustomers: number;
  stillWaiting: number;
}
