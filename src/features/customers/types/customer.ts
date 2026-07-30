export type CustomerStatus = 'active' | 'inactive';

export interface CustomerBranch {
  id: string;
  name: string;
  code: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  fullName: string;
  gender: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  branchId: string | null;
  branch: CustomerBranch | null;
}

export type CustomerDatePreset = "today" | "yesterday" | "7d" | "30d" | "this-month" | "custom" | "all"

export type CustomerViewType = 'all' | 'subscription';

export interface CustomerFilters {
  search: string;
  status: CustomerStatus | 'all';
  datePreset: CustomerDatePreset;
  customStartDate: string;
  customEndDate: string;
  branchId: string;
  viewType: CustomerViewType;
}

export const CUSTOMER_STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  inactive: { label: 'Inactive', color: 'text-red-700', bgColor: 'bg-red-50' },
};
