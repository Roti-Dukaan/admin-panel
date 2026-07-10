export type CustomerStatus = 'active' | 'inactive';

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
}

export interface CustomerFilters {
  search: string;
  status: CustomerStatus | 'all';
}

export const CUSTOMER_STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  inactive: { label: 'Inactive', color: 'text-red-700', bgColor: 'bg-red-50' },
};
