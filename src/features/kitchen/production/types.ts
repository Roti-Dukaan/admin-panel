export type MealSlot = "breakfast" | "lunch" | "dinner";
export type ProductionBatchStatus = "PENDING" | "COOKING" | "COMPLETED" | "CANCELLED";
export type ProductionItemStatus = ProductionBatchStatus | "PARTIAL";

export interface ProductionItem {
  foodItemId: string | null;
  foodName: string;
  mealSlot: MealSlot;
  requiredQuantity: number;
  preparedQuantity: number;
  remainingQuantity: number;
  category: string | null;
  isVeg: boolean | null;
  status: ProductionItemStatus;
}

export interface ProductionSummary {
  date: string;
  totalOrders: number;
  subscriptionOrders: number;
  manualOrders: number;
  totalRotis: number;
  vegMeals: number;
  nonVegMeals: number;
  totalItems: number;
  byMealSlot: Record<MealSlot, { orders: number; items: number }>;
}

export interface ProductionPlan {
  summary: ProductionSummary;
  bySlot: Record<MealSlot, ProductionItem[]>;
}

export interface ProductionBatchItem {
  id: string;
  foodItemId: string | null;
  foodName: string;
  mealSlot: MealSlot;
  requiredQuantity: number;
  preparedQuantity: number;
  remainingQuantity: number;
  notes: string | null;
  updatedById: string | null;
  status: ProductionItemStatus;
}

export interface ProductionBatch {
  id: string;
  date: string;
  name: string;
  mealSlot: MealSlot;
  scheduledStartTime: string;
  status: ProductionBatchStatus;
  createdById: string | null;
  createdAt: string;
  items: ProductionBatchItem[];
}

export interface CreateProductionBatchPayload {
  date?: string;
  name: string;
  mealSlot: MealSlot;
  scheduledStartTime: string;
  items?: Array<{ foodItemId?: string; foodName: string; requiredQuantity?: number }>;
}

export interface AddBatchItemPayload {
  foodItemId?: string;
  foodName: string;
  requiredQuantity?: number;
}

export interface UpdatePreparedPayload {
  preparedQuantity: number;
  notes?: string;
}

export interface UpdateBatchStatusPayload {
  status: ProductionBatchStatus;
}

export type KitchenReportType =
  | "daily_production"
  | "food_consumption"
  | "meal_count"
  | "batch";

export interface KitchenReportOptions {
  format: "csv" | "excel" | "pdf";
  type: KitchenReportType;
  date?: string;
}
