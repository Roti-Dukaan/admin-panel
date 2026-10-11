export type PushNotificationStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'PARTIALLY_SENT'
  | 'FAILED'
  | 'CANCELLED';

export type TargetType =
  | 'all_customers'
  | 'active_subscriptions'
  | 'deliveries_tomorrow'
  | 'menu_not_selected'
  | 'pending_payment'
  | 'all_delivery_boys'
  | 'route_assigned'
  | 'all_branch_managers'
  | 'branch_managers'
  | 'branch'
  | 'specific_users'
  | 'role';

export interface PushNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  route?: string | null;
  targetType: TargetType;
  targetUserId?: string | null;
  targetBranchId?: string | null;
  targetRole?: string | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
  status: PushNotificationStatus;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name?: string | null; email: string };
}

export interface CreateNotificationInput {
  type: string;
  title: string;
  body: string;
  imageUrl?: string;
  entityType?: string;
  entityId?: string;
  route?: string;
  targetType: TargetType;
  targetUserId?: string;
  targetBranchId?: string;
  targetRole?: string;
  scheduledAt?: string;
  sendNow?: boolean;
}

export interface NotificationAnalytics {
  campaign: PushNotification;
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
  pending: number;
  total: number;
}

export interface NotificationListResponse {
  items: PushNotification[];
  total: number;
  page: number;
  limit: number;
}

export const TARGET_TYPE_OPTIONS: { value: TargetType; label: string }[] = [
  { value: 'all_customers', label: 'All customers' },
  { value: 'active_subscriptions', label: 'Customers with active subscriptions' },
  { value: 'all_delivery_boys', label: 'All delivery partners' },
  { value: 'all_branch_managers', label: 'All branch managers' },
  { value: 'branch', label: 'Specific branch' },
  { value: 'branch_managers', label: 'Branch managers of selected branch' },
  { value: 'specific_users', label: 'Specific user' },
  { value: 'role', label: 'By role' },
];

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'promotion', label: 'Promotion' },
  { value: 'system_announcement', label: 'System announcement' },
  { value: 'order_ready', label: 'Order ready' },
  { value: 'subscription_menu_selection_reminder', label: 'Menu selection reminder' },
  { value: 'subscription_delivery_reminder', label: 'Delivery reminder' },
  { value: 'payment_pending', label: 'Payment pending' },
];
