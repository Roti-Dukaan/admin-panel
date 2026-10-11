export type FoodCategory = string;

export type Availability = 'available' | 'unavailable' | 'out-of-stock';

export type HealthTag = 'high-protein' | 'high-fiber' | 'healthy' | 'gluten-free' | 'vegan' | 'homemade' | 'kids-friendly';

/** Mirrors the CustomerLabel enum persisted by the backend. */
export type CustomerLabel = 'CHEF_SPECIAL' | 'BEST_SELLER' | 'NEW' | 'RECOMMENDED' | 'POPULAR';

export type FoodType = 'VEG' | 'NON_VEG' | 'EGG';

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  bgColor: string;
  imageUrl?: string;
  sortOrder: number;
  createdAt: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  servingSize: string;
}

export interface FoodItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: FoodCategory;
  price: number;
  preparationTime: number;
  nutrition: NutritionInfo;
  healthTags: HealthTag[];
  customerLabels: CustomerLabel[];
  availability: Availability;
  foodType: FoodType;
  isFeatured: boolean;
  displayOnWebsite: boolean;
  bestPairedWith: string[];
  imageUrl: string;
  galleryImages: string[];
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface FoodItemFormData {
  name: string;
  description: string;
  shortDescription: string;
  category: FoodCategory;
  price: number;
  preparationTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  servingSize: string;
  healthTags: HealthTag[];
  customerLabels: CustomerLabel[];
  availability: Availability;
  foodType: FoodType;
  isFeatured: boolean;
  displayOnWebsite: boolean;
  bestPairedWith: string[];
  sortOrder: number;
}

export interface MenuFilters {
  search: string;
  category: FoodCategory[];
  availability: Availability[];
  healthTags: HealthTag[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Rotis', slug: 'rotis', emoji: '🌾', color: 'text-amber-700', bgColor: 'bg-amber-50', sortOrder: 0, createdAt: Date.now() },
  { id: 'cat-2', name: 'Veg', slug: 'veg', emoji: '🥬', color: 'text-green-700', bgColor: 'bg-green-50', sortOrder: 1, createdAt: Date.now() },
  { id: 'cat-3', name: 'Non Veg', slug: 'non-veg', emoji: '🍗', color: 'text-red-700', bgColor: 'bg-red-50', sortOrder: 2, createdAt: Date.now() },
  { id: 'cat-4', name: 'Combos', slug: 'combos', emoji: '🍱', color: 'text-purple-700', bgColor: 'bg-purple-50', sortOrder: 3, createdAt: Date.now() },
];

export const EMOJI_OPTIONS = ['🌾', '🥬', '🍗', '🍱', '🍛', '🧀', '🍅', '🍄', '🥚', '🥗', '🍽️', '🫓', '🌿', '🍖', '🥘', '🍲', '🫕', '🥩', '🍕', '🌮'];

export const COLOR_OPTIONS = [
  { label: 'Amber', value: 'text-amber-700', bg: 'bg-amber-50' },
  { label: 'Green', value: 'text-green-700', bg: 'bg-green-50' },
  { label: 'Red', value: 'text-red-700', bg: 'bg-red-50' },
  { label: 'Purple', value: 'text-purple-700', bg: 'bg-purple-50' },
  { label: 'Blue', value: 'text-blue-700', bg: 'bg-blue-50' },
  { label: 'Pink', value: 'text-pink-700', bg: 'bg-pink-50' },
  { label: 'Orange', value: 'text-orange-700', bg: 'bg-orange-50' },
  { label: 'Teal', value: 'text-teal-700', bg: 'bg-teal-50' },
  { label: 'Indigo', value: 'text-indigo-700', bg: 'bg-indigo-50' },
  { label: 'Gray', value: 'text-gray-700', bg: 'bg-gray-100' },
];

export const AVAILABILITY_CONFIG: Record<Availability, { label: string; color: string; bgColor: string; dotColor: string }> = {
  available: { label: 'Available', color: 'text-emerald-700', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-500' },
  unavailable: { label: 'Unavailable', color: 'text-gray-600', bgColor: 'bg-gray-100', dotColor: 'bg-gray-400' },
  'out-of-stock': { label: 'Out of Stock', color: 'text-red-700', bgColor: 'bg-red-50', dotColor: 'bg-red-500' },
};

export const HEALTH_TAG_CONFIG: Record<HealthTag, { label: string; emoji: string }> = {
  'high-protein': { label: 'High Protein', emoji: '💪' },
  'high-fiber': { label: 'High Fiber', emoji: '🌾' },
  healthy: { label: 'Healthy', emoji: '💚' },
  'gluten-free': { label: 'Gluten Free', emoji: '🚫' },
  vegan: { label: 'Vegan', emoji: '🌱' },
  homemade: { label: 'Homemade', emoji: '🏠' },
  'kids-friendly': { label: 'Kids Friendly', emoji: '👶' },
};

export const CUSTOMER_LABEL_CONFIG: Record<CustomerLabel, { label: string; color: string; bgColor: string }> = {
  CHEF_SPECIAL: { label: 'Chef Special', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  BEST_SELLER: { label: 'Best Seller', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  NEW: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  RECOMMENDED: { label: 'Recommended', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  POPULAR: { label: 'Popular', color: 'text-violet-700', bgColor: 'bg-violet-50' },
};
