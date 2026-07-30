export type BannerFormData = {
  title: string;
  subtitle?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  redirectType: 'NONE' | 'CATEGORY' | 'PRODUCT' | 'SUBSCRIPTION' | 'EXTERNAL_URL';
  redirectValue?: string;
  displayOrder?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
};

export type BannerImageFile = {
  desktopImage?: File | null;
  mobileImage?: File | null;
};

export type RedirectType = 'NONE' | 'CATEGORY' | 'PRODUCT' | 'SUBSCRIPTION' | 'EXTERNAL_URL';

export type BannerStatus = 'active' | 'inactive';

export interface BannerListFilters {
  search: string;
  statusFilter: 'all' | 'active' | 'inactive';
}