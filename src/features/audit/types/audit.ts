export interface AuditLogAdmin {
  id: string;
  email: string;
  name: string | null;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: AuditLogAdmin;
}

export interface AuditLogFilters {
  entity: string;
  adminId: string;
  action: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  limit: number;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogStats {
  totalLogs: number;
  logsToday: number;
  uniqueAdmins: number;
  topEntity: string | null;
}

export const AUDIT_ENTITIES = [
  'Order',
  'Delivery',
  'Menu',
  'Customer',
  'Settings',
  'Kitchen',
  'Payment',
  'Role',
  'Admin',
  'Subscription',
] as const;

export const AUDIT_ACTIONS = [
  'CREATED',
  'UPDATED',
  'DELETED',
  'STATUS_CHANGED',
  'KITCHEN_STATUS_UPDATED',
  'LOGIN',
  'LOGOUT',
] as const;
