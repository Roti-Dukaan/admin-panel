export type PermissionAction = 'no_access' | 'view' | 'create' | 'update' | 'delete' | 'export' | 'approve' | 'configure';

export type RoleStatus = 'active' | 'inactive';

export type AuditAction = 'role_created' | 'permission_updated' | 'user_assigned' | 'user_removed' | 'role_archived' | 'role_cloned' | 'role_deleted';

export interface ModulePermission {
  module: RBACModule;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: RoleStatus;
  isSystem: boolean;
  permissions: ModulePermission[];
  usersAssigned: string[];
  createdAt: number;
  updatedAt: number;
  hierarchyLevel: number;
}

export interface RBACUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  roleId: string;
  lastLogin: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface AuditEntry {
  id: string;
  action: AuditAction;
  roleId: string;
  roleName: string;
  performedBy: string;
  details: string;
  timestamp: number;
}

export type RBACModule =
  | 'dashboard'
  | 'orders'
  | 'kitchen'
  | 'customers'
  | 'area_requests'
  | 'menu'
  | 'categories'
  | 'subscription_plans'
  | 'delivery_slots'
  | 'reports'
  | 'payments'
  | 'coupons'
  | 'referrals'
  | 'cms'
  | 'notifications'
  | 'support'
  | 'settings'
  | 'roles'
  | 'audit_logs';

export const RBAC_MODULES: { key: RBACModule; label: string; description: string }[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'View analytics and overview data' },
  { key: 'orders', label: 'Orders', description: 'Manage customer orders' },
  { key: 'kitchen', label: 'Kitchen', description: 'Kitchen operations and preparation' },
  { key: 'customers', label: 'Customers', description: 'Customer management and profiles' },
  { key: 'area_requests', label: 'Area Requests', description: 'Coming-soon expansion requests by city' },
  { key: 'menu', label: 'Menu', description: 'Menu item management' },
  { key: 'categories', label: 'Categories', description: 'Category management' },
  { key: 'subscription_plans', label: 'Subscription Plans', description: 'Plan configuration and management' },
  { key: 'delivery_slots', label: 'Delivery Slots', description: 'Delivery slot scheduling' },
  { key: 'reports', label: 'Reports', description: 'Analytics and reporting' },
  { key: 'payments', label: 'Payments', description: 'Payment processing and refunds' },
  { key: 'coupons', label: 'Coupons', description: 'Coupon and discount management' },
  { key: 'referrals', label: 'Referrals', description: 'Referral campaigns, tracking, and fraud review' },
  { key: 'cms', label: 'CMS', description: 'Website and mobile app content' },
  { key: 'notifications', label: 'Notifications', description: 'Push notification campaigns' },
  { key: 'support', label: 'Customer Support', description: 'Support tickets and help desk' },
  { key: 'settings', label: 'Settings', description: 'System configuration' },
  { key: 'roles', label: 'Roles & Permissions', description: 'Role and permission management' },
  { key: 'audit_logs', label: 'Audit Logs', description: 'Activity and audit trail' },
];

export const PERMISSION_ACTIONS: { key: PermissionAction; label: string; description: string }[] = [
  { key: 'view', label: 'View', description: 'Can view data' },
  { key: 'create', label: 'Create', description: 'Can create new records' },
  { key: 'update', label: 'Update', description: 'Can modify existing records' },
  { key: 'delete', label: 'Delete', description: 'Can remove records' },
  { key: 'export', label: 'Export', description: 'Can export data' },
  { key: 'approve', label: 'Approve', description: 'Can approve actions' },
  { key: 'configure', label: 'Configure', description: 'Can change settings' },
];

export const ROLE_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6b7280', label: 'Gray' },
];

export const ROLE_ICONS = [
  'Shield',
  'Crown',
  'Users',
  'UserCog',
  'ChefHat',
  'Truck',
  'Headphones',
  'DollarSign',
  'Eye',
  'Star',
  'Key',
  'Lock',
  'Globe',
  'Settings',
  'Bookmark',
];
