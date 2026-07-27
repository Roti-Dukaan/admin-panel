import { create } from "zustand";
import { toast } from "sonner";
import { subscriptionMenuApi } from "../services/subscription-menu.api";
import type { SubscriptionMenuItem, SubscriptionMenuItemForm } from "../types/subscription-menu";

interface SubscriptionMenuStore {
  items: SubscriptionMenuItem[];
  loading: boolean;
  drawerOpen: boolean;
  drawerMode: "add" | "edit" | "view";
  selectedItem: SubscriptionMenuItem | null;
  loadItems: () => Promise<void>;
  openAddDrawer: () => void;
  openEditDrawer: (item: SubscriptionMenuItem) => void;
  openViewDrawer: (item: SubscriptionMenuItem) => void;
  closeDrawer: () => void;
  addItem: (payload: SubscriptionMenuItemForm) => Promise<void>;
  updateItem: (id: string, payload: Partial<SubscriptionMenuItemForm>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

export const useSubscriptionMenuStore = create<SubscriptionMenuStore>((set, get) => ({
  items: [],
  loading: false,
  drawerOpen: false,
  drawerMode: "add",
  selectedItem: null,

  loadItems: async () => {
    set({ loading: true });
    try {
      const items = await subscriptionMenuApi.list();
      set({ items });
    } catch {
      toast.error("Failed to load subscription menu items");
    } finally {
      set({ loading: false });
    }
  },

  openAddDrawer: () => set({ drawerOpen: true, drawerMode: "add", selectedItem: null }),
  openEditDrawer: (item) => set({ drawerOpen: true, drawerMode: "edit", selectedItem: item }),
  openViewDrawer: (item) => set({ drawerOpen: true, drawerMode: "view", selectedItem: item }),
  closeDrawer: () => set({ drawerOpen: false, selectedItem: null }),

  addItem: async (payload) => {
    await subscriptionMenuApi.create(payload);
    toast.success("Subscription menu item created");
    await get().loadItems();
  },

  updateItem: async (id, payload) => {
    await subscriptionMenuApi.update(id, payload);
    toast.success("Subscription menu item updated");
    await get().loadItems();
  },

  removeItem: async (id) => {
    await subscriptionMenuApi.remove(id);
    toast.success("Subscription menu item removed");
    await get().loadItems();
  },
}));
