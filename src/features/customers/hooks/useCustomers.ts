import { create } from 'zustand';
import { Customer, CustomerFilters, CustomerDatePreset } from '../types/customer';
import { customerApi, type ApiCustomer, type ApiCustomerAddress } from '@/lib/api/customer.api';

interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
}

interface CustomerStore {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: CustomerFilters;
  selectedCustomer: Customer | null;
  drawerOpen: boolean;
  drawerSection: string;
  loading: boolean;
  error: string | null;
  customerAddresses: ApiCustomerAddress[];
  addressesLoading: boolean;

  fetchCustomers: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (filter: CustomerFilters['status']) => void;
  setDateRange: (preset: CustomerDatePreset, startDate?: string, endDate?: string) => void;
  clearFilters: () => void;

  setSelectedCustomer: (customer: Customer | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerSection: (section: string) => void;
  openCustomer: (id: string) => Promise<void>;
  fetchCustomerAddresses: (customerId: string) => Promise<void>;
  toggleCustomerStatus: (id: string) => Promise<void>;

  getStats: () => CustomerStats;
}

function mapCustomer(c: ApiCustomer): Customer {
  return {
    id: c.id,
    name: c.fullName || c.name || c.phone || c.email || 'Unknown',
    phone: c.phone || '',
    email: c.email || '',
    fullName: c.fullName || '',
    gender: c.gender,
    isVerified: c.isVerified,
    isActive: c.isActive,
    lastLoginAt: c.lastLoginAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

const initialFilters: CustomerFilters = {
  search: '',
  status: 'all',
  datePreset: 'all',
  customStartDate: '',
  customEndDate: '',
};

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  filters: { ...initialFilters },
  selectedCustomer: null,
  drawerOpen: false,
  drawerSection: 'information',
  loading: false,
  error: null,
  customerAddresses: [],
  addressesLoading: false,

  fetchCustomers: async () => {
    const { filters, page, limit } = get();
    set({ loading: true, error: null });
    try {
      const params: Record<string, unknown> = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.status === 'active') params.isActive = true;
      if (filters.status === 'inactive') params.isActive = false;

      const res = await customerApi.list(params);
      const data = res.data;
      set({
        customers: data.items.map(mapCustomer),
        total: data.total,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load customers';
      set({ loading: false, error: message });
    }
  },

  setPage: (page) => {
    set({ page });
    get().fetchCustomers();
  },

  setSearch: (search) => {
    set({ filters: { ...get().filters, search }, page: 1 });
    get().fetchCustomers();
  },

  setStatusFilter: (status) => {
    set({ filters: { ...get().filters, status }, page: 1 });
    get().fetchCustomers();
  },

  setDateRange: (preset, startDate = '', endDate = '') => {
    set({
      filters: {
        ...get().filters,
        datePreset: preset,
        customStartDate: startDate,
        customEndDate: endDate,
      },
      page: 1,
    });
    get().fetchCustomers();
  },

  clearFilters: () => {
    set({ filters: { ...initialFilters }, page: 1 });
    get().fetchCustomers();
  },

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer, drawerOpen: !!customer, drawerSection: 'information' }),

  openCustomer: async (id) => {
    set({ drawerOpen: true, drawerSection: 'information', loading: true, error: null });
    try {
      const res = await customerApi.getById(id);
      const c = res.data;
      set({
        selectedCustomer: {
          id: c.id,
          name: c.fullName || c.name || c.phone || c.email || 'Unknown',
          phone: c.phone || '',
          email: c.email || '',
          fullName: c.fullName || '',
          gender: c.gender,
          isVerified: c.isVerified,
          isActive: c.isActive,
          lastLoginAt: c.lastLoginAt,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  fetchCustomerAddresses: async (customerId) => {
    set({ addressesLoading: true });
    try {
      const res = await customerApi.getAddresses(customerId);
      set({ customerAddresses: res.data.addresses, addressesLoading: false });
    } catch {
      set({ customerAddresses: [], addressesLoading: false });
    }
  },

  setDrawerOpen: (open) => set((state) => ({
    drawerOpen: open,
    selectedCustomer: open ? state.selectedCustomer : null,
    drawerSection: 'information',
    customerAddresses: open ? state.customerAddresses : [],
  })),

  setDrawerSection: (section) => set({ drawerSection: section }),

  toggleCustomerStatus: async (id) => {
    const customer = get().customers.find((c) => c.id === id);
    if (!customer) return;
    try {
      await customerApi.updateStatus(id, !customer.isActive);
      set({
        customers: get().customers.map((c) =>
          c.id === id ? { ...c, isActive: !c.isActive } : c
        ),
      });
    } catch {
      // ignore
    }
  },

  getStats: () => {
    const { customers } = get();
    return {
      total: customers.length,
      active: customers.filter((c) => c.isActive).length,
      inactive: customers.filter((c) => !c.isActive).length,
    };
  },
}));
