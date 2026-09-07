"use client";

import type { AppHomePageSection } from '@/features/app-home-page/types/app-home-page';
import { normalizeBannerSlides, sectionTypeLabel } from '@/features/app-home-page/types/app-home-page';

interface MobilePreviewProps {
  location: string;
  sections: AppHomePageSection[];
}

export function MobilePreview({ location, sections }: MobilePreviewProps) {
  return (
    <div className="sticky top-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Mobile Preview</p>
      <div className="mx-auto w-[280px] rounded-[2rem] border-[10px] border-gray-900 bg-white shadow-2xl overflow-hidden">
        <div className="h-6 bg-gray-900" />
        <div className="max-h-[520px] overflow-y-auto bg-gray-50 p-3 space-y-3">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-600">
            <span>📍</span>
            <span>{location || 'All locations'}</span>
          </div>

          {sections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-xs text-gray-400">
              Add sections to preview the mobile home page
            </div>
          ) : (
            sections.map((section) => (
              <PreviewBlock key={section.id} section={section} />
            ))
          )}
        </div>
        <div className="h-4 bg-gray-900" />
      </div>
    </div>
  );
}

function PreviewBlock({ section }: { section: AppHomePageSection }) {
  const cfg = section.config ?? {};
  const type = section.type ?? section.sectionType.toLowerCase();

  if (type === 'banner' || type === 'BANNER'.toLowerCase() || section.sectionType === 'BANNER') {
    const slides = normalizeBannerSlides(cfg);
    const firstImage = slides.find((slide) => slide.bannerImage)?.bannerImage ?? '';
    return (
      <div className="overflow-hidden rounded-xl bg-orange-100">
        {firstImage ? (
          <div className="relative">
            <img src={firstImage} alt="" className="h-20 w-full object-cover" />
            {slides.length > 1 && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                {slides.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full ${i === 0 ? 'w-3 bg-orange-600' : 'w-1.5 bg-white/80'}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center text-xs font-bold text-orange-700">
            {slides[0]?.title ?? section.title ?? 'SALE BANNER'}
          </div>
        )}
      </div>
    );
  }

  if (type === 'category_grid' || section.sectionType === 'CATEGORY_GRID') {
    const cats = (cfg.categories as { name?: string; icon?: string }[] | undefined) ?? [];
    return (
      <div>
        <p className="mb-2 text-[11px] font-bold text-gray-800">{section.title ?? 'Categories'}</p>
        <div className="grid grid-cols-4 gap-2">
          {(cats.length ? cats.slice(0, 8) : [{ name: '🥦' }, { name: '🥛' }, { name: '🍪' }, { name: '🧴' }]).map((cat, i) => (
            <div key={i} className="flex flex-col items-center rounded-lg bg-white p-2 text-[9px] font-semibold text-gray-700">
              {cat.icon ? (
                <img src={cat.icon} alt="" className="mb-1 h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="text-lg">{cat.name?.slice(0, 2) ?? '•'}</span>
              )}
              <span className="truncate">{cat.name ?? 'Cat'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'product_carousel' || type === 'product_grid' || type === 'price_band' ||
      ['PRODUCT_CAROUSEL', 'PRODUCT_GRID', 'PRICE_BAND'].includes(section.sectionType)) {
    const products = (cfg.products as { name?: string; image?: string; price?: number }[] | undefined) ?? [];
    const title = String(cfg.title ?? section.title ?? sectionTypeLabel(section.sectionType));
    const isGrid = type === 'product_grid' || type === 'price_band' || section.sectionType === 'PRODUCT_GRID' || section.sectionType === 'PRICE_BAND';
    const items = products.length
      ? products
      : [{ name: '🍪' }, { name: '🥛' }, { name: '🍫' }];
    return (
      <div>
        <p className="mb-2 text-[11px] font-bold text-gray-800">{title}</p>
        <div className={isGrid ? 'grid grid-cols-3 gap-2' : 'flex gap-2 overflow-x-auto'}>
          {items.slice(0, isGrid ? 6 : 4).map((p, i) => (
            <div key={i} className="min-w-[64px] rounded-lg bg-white p-2 shadow-sm">
              {p.image ? (
                <img src={p.image} alt="" className="mb-1 h-12 w-full rounded object-cover" />
              ) : (
                <div className="mb-1 flex h-12 items-center justify-center rounded bg-gray-100 text-lg">
                  {p.name?.slice(0, 2) ?? '•'}
                </div>
              )}
              <p className="truncate text-[8px] font-semibold text-gray-700">{p.name ?? 'Product'}</p>
              {p.price != null && <p className="text-[8px] text-orange-600">₹{p.price}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'offers' || section.sectionType === 'OFFERS') {
    const image = String(cfg.bannerImage ?? '');
    return (
      <div className="overflow-hidden rounded-xl border border-orange-200 bg-orange-50">
        {image ? <img src={image} alt="" className="h-16 w-full object-cover" /> : null}
        <div className="p-2 text-[10px] font-bold text-orange-800">
          {String(cfg.title ?? section.title ?? 'Festive Offers')}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-2 text-[10px] text-gray-500">
      {sectionTypeLabel(section.sectionType)}
    </div>
  );
}
