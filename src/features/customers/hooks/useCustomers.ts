import { create } from 'zustand';
import { Customer, CustomerFilters, CustomerStatus, PaymentMethod } from '../types/customer';
import { mockCustomers } from '../mock/customers';

interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  subscribers: number;
  repeatCustomers: number;
  vipCustomers: number;
}

interface CustomerStore {
  customers: Customer[];
  filters: CustomerFilters;
  selectedCustomer: Customer | null;
  drawerOpen: boolean;
  drawerSection: string;

  setSearch: (search: string) => void;
  setSubscriptionFilter: (filter: CustomerFilters['subscription']) => void;
  setStatusFilter: (filter: CustomerFilters['status']) => void;
  setPincodeFilter: (pincode: string) => void;
  setPaymentPreferenceFilter: (filter: CustomerFilters['paymentPreference']) => void;
  clearFilters: () => void;

  setSelectedCustomer: (customer: Customer | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerSection: (section: string) => void;

  getFilteredCustomers: () => Customer[];
  getStats: () => CustomerStats;
}

const initialFilters: CustomerFilters = {
  search: '',
  subscription: 'all',
  status: 'all',
  pincode: '',
  paymentPreference: 'all',
};

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: mockCustomers,
  filters: { ...initialFilters },
  selectedCustomer: null,
  drawerOpen: false,
  drawerSection: 'information',

  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),

  setSubscriptionFilter: (subscription) => set((state) => ({ filters: { ...state.filters, subscription } })),

  setStatusFilter: (status) => set((state) => ({ filters: { ...state.filters, status } })),

  setPincodeFilter: (pincode) => set((state) => ({ filters: { ...state.filters, pincode } })),

  setPaymentPreferenceFilter: (paymentPreference) => set((state) => ({ filters: { ...state.filters, paymentPreference } })),

  clearFilters: () => set({ filters: { ...initialFilters } }),

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer, drawerOpen: !!customer, drawerSection: 'information' }),

  setDrawerOpen: (open) => set((state) => ({
    drawerOpen: open,
    selectedCustomer: open ? state.selectedCustomer : null,
    drawerSection: 'information',
  })),

  setDrawerSection: (section) => set({ drawerSection: section }),

  getFilteredCustomers: () => {
    const { customers, filters } = get();
    let filtered = [...customers];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.pincode.includes(q)
      );
    }

    if (filters.subscription === 'subscribed') {
      filtered = filtered.filter((c) => c.isSubscriber);
    } else if (filters.subscription === 'not-subscribed') {
      filtered = filtered.filter((c) => !c.isSubscriber);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    if (filters.pincode) {
      filtered = filtered.filter((c) => c.pincode === filters.pincode);
    }

    if (filters.paymentPreference !== 'all') {
      filtered = filtered.filter((c) => c.insights.preferredPaymentMethod === filters.paymentPreference);
    }

    return filtered;
  },

  getStats: () => {
    const { customers } = get();
    return {
      total: customers.length,
      active: customers.filter((c) => c.status === 'active').length,
      inactive: customers.filter((c) => c.status === 'inactive').length,
      subscribers: customers.filter((c) => c.isSubscriber).length,
      repeatCustomers: customers.filter((c) => c.isRepeatCustomer).length,
      vipCustomers: customers.filter((c) => c.isVip).length,
    };
  },
}));
