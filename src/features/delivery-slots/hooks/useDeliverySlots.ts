import { create } from 'zustand';
import {
  DeliverySlotConfig,
  SlotStatus,
  DrawerMode,
  SpecialDate,
} from '../types/delivery-slot';
import { mockDeliverySlots } from '../mock/delivery-slots';

interface DeliverySlotStore {
  slots: DeliverySlotConfig[];
  loading: boolean;
  searchQuery: string;
  statusFilter: SlotStatus | 'all';
  mealFilter: string | 'all';

  drawerOpen: boolean;
  drawerMode: DrawerMode;
  selectedSlot: DeliverySlotConfig | null;

  deleteModalOpen: boolean;
  slotToDelete: DeliverySlotConfig | null;

  setSearchQuery: (q: string) => void;
  setStatusFilter: (s: SlotStatus | 'all') => void;
  setMealFilter: (m: string | 'all') => void;

  openCreateDrawer: () => void;
  openEditDrawer: (slot: DeliverySlotConfig) => void;
  openViewDrawer: (slot: DeliverySlotConfig) => void;
  closeDrawer: () => void;

  openDeleteModal: (slot: DeliverySlotConfig) => void;
  closeDeleteModal: () => void;

  addSlot: (data: Omit<DeliverySlotConfig, 'id' | 'createdAt' | 'updatedAt' | 'currentBookings' | 'todayBookings'>) => void;
  updateSlot: (id: string, data: Partial<DeliverySlotConfig>) => void;
  deleteSlot: (id: string) => void;
  duplicateSlot: (slot: DeliverySlotConfig) => void;
  toggleStatus: (id: string, status: SlotStatus) => void;

  addSpecialDate: (slotId: string, date: SpecialDate) => void;
  removeSpecialDate: (slotId: string, dateId: string) => void;
}

export const useDeliverySlotStore = create<DeliverySlotStore>((set, get) => ({
  slots: mockDeliverySlots,
  loading: false,
  searchQuery: '',
  statusFilter: 'all',
  mealFilter: 'all',

  drawerOpen: false,
  drawerMode: 'create',
  selectedSlot: null,

  deleteModalOpen: false,
  slotToDelete: null,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setStatusFilter: (s) => set({ statusFilter: s }),
  setMealFilter: (m) => set({ mealFilter: m }),

  openCreateDrawer: () => set({ drawerOpen: true, drawerMode: 'create', selectedSlot: null }),
  openEditDrawer: (slot) => set({ drawerOpen: true, drawerMode: 'edit', selectedSlot: slot }),
  openViewDrawer: (slot) => set({ drawerOpen: true, drawerMode: 'view', selectedSlot: slot }),
  closeDrawer: () => set({ drawerOpen: false, selectedSlot: null }),

  openDeleteModal: (slot) => set({ deleteModalOpen: true, slotToDelete: slot }),
  closeDeleteModal: () => set({ deleteModalOpen: false, slotToDelete: null }),

  addSlot: (data) => {
    const now = Date.now();
    const newSlot: DeliverySlotConfig = {
      ...data,
      id: `slot-${now}`,
      currentBookings: 0,
      todayBookings: 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      slots: [newSlot, ...state.slots],
      drawerOpen: false,
      selectedSlot: null,
    }));
  },

  updateSlot: (id, data) =>
    set((state) => ({
      slots: state.slots.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: Date.now() } : s
      ),
      drawerOpen: false,
      selectedSlot: null,
    })),

  deleteSlot: (id) =>
    set((state) => ({
      slots: state.slots.filter((s) => s.id !== id),
      deleteModalOpen: false,
      slotToDelete: null,
    })),

  duplicateSlot: (slot) => {
    const now = Date.now();
    const dup: DeliverySlotConfig = {
      ...slot,
      id: `slot-${now}`,
      name: `${slot.name}-copy`,
      displayName: `${slot.displayName} (Copy)`,
      status: 'draft',
      currentBookings: 0,
      todayBookings: 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ slots: [dup, ...state.slots] }));
  },

  toggleStatus: (id, status) =>
    set((state) => ({
      slots: state.slots.map((s) =>
        s.id === id ? { ...s, status, updatedAt: Date.now() } : s
      ),
    })),

  addSpecialDate: (slotId, date) =>
    set((state) => ({
      slots: state.slots.map((s) =>
        s.id === slotId
          ? { ...s, specialDates: [...s.specialDates, date], updatedAt: Date.now() }
          : s
      ),
    })),

  removeSpecialDate: (slotId, dateId) =>
    set((state) => ({
      slots: state.slots.map((s) =>
        s.id === slotId
          ? { ...s, specialDates: s.specialDates.filter((d) => d.id !== dateId), updatedAt: Date.now() }
          : s
      ),
    })),
}));
