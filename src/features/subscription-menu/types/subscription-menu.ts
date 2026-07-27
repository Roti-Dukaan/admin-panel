export type RotiType = "JOWAR" | "RAGI" | "WHEAT" | "OTHERS";

export const ROTI_TYPE_LABELS: Record<RotiType, string> = {
  JOWAR: "Jowar",
  RAGI: "Ragi",
  WHEAT: "Wheat",
  OTHERS: "Others",
};

export interface SubscriptionMenuItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  rotiType: RotiType;
  description?: string | null;
  image?: string | null;
  active: boolean;
  subscriptionEnabled: boolean;
  availableSlots?: string[] | null;
  defaultQty: number;
  sortOrder: number;
  kitchenLabel?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanMenuLink {
  id: string;
  planId: string;
  subscriptionMenuItemId: string;
  sortOrder: number;
  isDefault: boolean;
  maxQtyPerDelivery?: number | null;
  menuItem?: SubscriptionMenuItem;
}

export interface SubscriptionMenuItemForm {
  name: string;
  slug?: string;
  category?: string;
  rotiType: RotiType;
  description?: string;
  image?: string;
  active: boolean;
  subscriptionEnabled: boolean;
  defaultQty: number;
  sortOrder: number;
  kitchenLabel?: string;
}

export const EMPTY_MENU_ITEM: SubscriptionMenuItemForm = {
  name: "",
  slug: "",
  category: "roti",
  rotiType: "WHEAT",
  description: "",
  active: true,
  subscriptionEnabled: true,
  defaultQty: 6,
  sortOrder: 0,
  kitchenLabel: "",
};
