export type AppHomePageSectionType =
  | 'BANNER'
  | 'CATEGORY_GRID'
  | 'PRODUCT_CAROUSEL'
  | 'PRODUCT_GRID'
  | 'OFFERS'
  | 'PRICE_BAND';

export type AppHomePageSectionApiType =
  | 'banner'
  | 'category_grid'
  | 'product_carousel'
  | 'product_grid'
  | 'offers'
  | 'price_band';

export interface AppHomePageSection {
  id: string;
  sectionType: AppHomePageSectionType;
  type: AppHomePageSectionApiType;
  sectionOrder: number;
  order: number;
  title?: string | null;
  config: Record<string, unknown>;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
  targetLocations?: string[] | null;
  targetAudience?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppHomePageSectionForm {
  sectionType: AppHomePageSectionType;
  title?: string;
  config: Record<string, unknown>;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
  targetLocations: string[];
}

export const SECTION_TYPE_OPTIONS: { value: AppHomePageSectionType; label: string; apiType: AppHomePageSectionApiType }[] = [
  { value: 'BANNER', label: 'Banner', apiType: 'banner' },
  { value: 'CATEGORY_GRID', label: 'Category Grid', apiType: 'category_grid' },
  { value: 'PRODUCT_CAROUSEL', label: 'Product Carousel', apiType: 'product_carousel' },
  { value: 'PRODUCT_GRID', label: 'Product Grid', apiType: 'product_grid' },
  { value: 'OFFERS', label: 'Offers / Festive Offers', apiType: 'offers' },
  { value: 'PRICE_BAND', label: 'Under ₹X Price Band', apiType: 'price_band' },
];

export function sectionTypeLabel(type: AppHomePageSectionType | AppHomePageSectionApiType): string {
  const map: Record<string, string> = {
    BANNER: 'Banner',
    CATEGORY_GRID: 'Category Grid',
    PRODUCT_CAROUSEL: 'Product Carousel',
    PRODUCT_GRID: 'Product Grid',
    OFFERS: 'Offers / Festive Offers',
    PRICE_BAND: 'Under ₹X Price Band',
    banner: 'Banner',
    category_grid: 'Category Grid',
    product_carousel: 'Product Carousel',
    product_grid: 'Product Grid',
    offers: 'Offers / Festive Offers',
    price_band: 'Under ₹X Price Band',
  };
  return map[type] ?? type;
}

export function sectionSummary(section: AppHomePageSection): string {
  const cfg = section.config ?? {};
  switch (section.sectionType) {
    case 'BANNER':
      {
        const slides = normalizeBannerSlides(cfg);
        if (slides.length > 1) return `${slides.length} banners`;
        return String(slides[0]?.title ?? section.title ?? 'Banner');
      }
    case 'OFFERS':
      {
        const slides = normalizeBannerSlides(cfg);
        if (slides.length > 1) return `${slides.length} offer banners`;
        return String(slides[0]?.title ?? section.title ?? 'Festive Offers');
      }
    case 'CATEGORY_GRID': {
      const cats = (cfg.categories as { name?: string }[] | undefined) ?? [];
      const ids = (cfg.categoryIds as string[] | undefined) ?? [];
      if (cats.length) return cats.map((c) => c.name).filter(Boolean).join(', ');
      return `${ids.length} categories`;
    }
    case 'PRODUCT_CAROUSEL':
    case 'PRODUCT_GRID': {
      const products = (cfg.products as unknown[] | undefined) ?? [];
      const ids = (cfg.productIds as string[] | undefined) ?? [];
      const count = products.length || ids.length;
      return `${section.title ?? 'Products'} (${count} items)`;
    }
    case 'PRICE_BAND':
      return `Under ₹${cfg.priceBand ?? 99}`;
    default:
      return section.title ?? 'Section';
  }
}

export function sectionStatusLabel(section: AppHomePageSection): string {
  const now = Date.now();
  if (!section.isActive) return 'Draft';
  if (section.startAt && new Date(section.startAt).getTime() > now) return 'Scheduled';
  if (section.endAt && new Date(section.endAt).getTime() < now) return 'Expired';
  return 'Active';
}

export interface BannerSlide {
  bannerImage: string;
  /** Lottie JSON URL (LottieFiles CDN) or leave empty to use banner image only */
  bannerLottie?: string;
  title: string;
  ctaText: string;
  actionType: string;
  actionTarget: string;
  actionUrl?: string | null;
}

export interface BannerUploadFiles {
  bannerImage?: File | null;
  bannerSlideFiles?: Record<number, File>;
  bannerLottie?: File | null;
  bannerLottieSlideFiles?: Record<number, File>;
}

export function defaultBannerSlide(): BannerSlide {
  return {
    bannerImage: '',
    bannerLottie: '',
    title: '',
    ctaText: 'Shop Now',
    actionType: 'category',
    actionTarget: '',
    actionUrl: null,
  };
}

export function defaultOffersSlide(): BannerSlide {
  return {
    bannerImage: '',
    bannerLottie: '',
    title: 'Festive Offers',
    ctaText: '',
    actionType: 'offer',
    actionTarget: '',
    actionUrl: null,
  };
}

export function normalizeBannerSlides(config: Record<string, unknown>): BannerSlide[] {
  const slides = config.slides;
  if (Array.isArray(slides) && slides.length > 0) {
    return slides.map((raw) => {
      const slide = (raw ?? {}) as Record<string, unknown>;
      return {
        bannerImage: String(slide.bannerImage ?? ''),
        bannerLottie: String(slide.bannerLottie ?? slide.lottieUrl ?? ''),
        title: String(slide.title ?? ''),
        ctaText: String(slide.ctaText ?? (slide.actionType === 'offer' ? '' : 'Shop Now')),
        actionType: String(slide.actionType ?? 'category'),
        actionTarget: String(slide.actionTarget ?? ''),
        actionUrl: slide.actionUrl != null ? String(slide.actionUrl) : null,
      };
    });
  }

  if (config.bannerImage || config.bannerLottie || config.title || config.ctaText || config.actionType) {
    return [{
      bannerImage: String(config.bannerImage ?? ''),
      bannerLottie: String(config.bannerLottie ?? config.lottieUrl ?? ''),
      title: String(config.title ?? ''),
      ctaText: String(config.ctaText ?? (config.actionType === 'offer' ? '' : 'Shop Now')),
      actionType: String(config.actionType ?? 'category'),
      actionTarget: String(config.actionTarget ?? ''),
      actionUrl: config.actionUrl != null ? String(config.actionUrl) : null,
    }];
  }

  return [defaultBannerSlide()];
}

export function bannerConfigFromSlides(slides: BannerSlide[]): Record<string, unknown> {
  return { slides };
}

export function defaultConfigForType(type: AppHomePageSectionType): Record<string, unknown> {
  switch (type) {
    case 'BANNER':
      return bannerConfigFromSlides([defaultBannerSlide()]);
    case 'CATEGORY_GRID':
      return { categoryIds: [], categories: [], displayMode: 'grid', maxItems: 8 };
    case 'PRODUCT_CAROUSEL':
      return {
        title: 'Trending Products',
        productIds: [],
        products: [],
        showPrice: true,
        showDiscount: true,
        showAddButton: true,
        displayMode: 'horizontal',
        maxItems: 6,
      };
    case 'PRODUCT_GRID':
      return {
        title: 'Featured Products',
        productIds: [],
        products: [],
        displayMode: 'grid',
        maxItems: 8,
      };
    case 'OFFERS':
      return bannerConfigFromSlides([defaultOffersSlide()]);
    case 'PRICE_BAND':
      return { title: 'Under ₹99', priceBand: 99, productIds: [], products: [], displayMode: 'grid', maxItems: 8 };
    default:
      return {};
  }
}

export const APP_HOME_BANNER_MAX_SIZE_MB = 3;
export const APP_HOME_BANNER_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const APP_HOME_LOTTIE_MAX_SIZE_MB = 2;

export function validateAppHomeBannerImage(file: File): string | null {
  if (!APP_HOME_BANNER_ALLOWED_TYPES.includes(file.type as (typeof APP_HOME_BANNER_ALLOWED_TYPES)[number])) {
    return `Unsupported file type. Allowed: JPG, PNG, WEBP`;
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > APP_HOME_BANNER_MAX_SIZE_MB) {
    return `File size (${sizeMb.toFixed(2)}MB) exceeds limit of ${APP_HOME_BANNER_MAX_SIZE_MB}MB`;
  }
  return null;
}

export function validateAppHomeBannerLottie(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.json')) {
    return 'Lottie file must be a .json file';
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > APP_HOME_LOTTIE_MAX_SIZE_MB) {
    return `File size (${sizeMb.toFixed(2)}MB) exceeds limit of ${APP_HOME_LOTTIE_MAX_SIZE_MB}MB`;
  }
  return null;
}
