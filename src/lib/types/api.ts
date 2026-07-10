export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiFoodItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string | null;
  description: string | null;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  gallery: string[];
  isVeg: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  isSubscriptionAvailable: boolean;
  preparationTime: number;
  calories: number | null;
  protein: number | null;
  fiber: number | null;
  servingSize: string | null;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  searchKeywords: string[];
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CategoryQueryParams {
  search?: string;
  status?: 'active' | 'inactive';
  sort?: 'name' | 'displayOrder' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FoodItemQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  categoryId?: string;
  featured?: boolean;
  veg?: 'veg' | 'non_veg';
  available?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name' | 'sort_order';
}
