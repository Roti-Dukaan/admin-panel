"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiCategory } from "@/lib/types/api";
import type { BannerSlide } from "@/features/app-home-page/types/app-home-page";
import {
  APP_HOME_BANNER_MAX_SIZE_MB,
  defaultBannerSlide,
  defaultOffersSlide,
  validateAppHomeBannerImage,
} from "@/features/app-home-page/types/app-home-page";

interface BannerSlidesEditorProps {
  slides: BannerSlide[];
  categories: ApiCategory[];
  slideFiles: Record<number, File>;
  fileErrors: Record<number, string>;
  onSlidesChange: (slides: BannerSlide[]) => void;
  onSlideFileChange: (index: number, file: File | null) => void;
  onFileError: (index: number, error: string | null) => void;
  variant?: "banner" | "offers";
}

export function BannerSlidesEditor({
  slides,
  categories,
  slideFiles,
  fileErrors,
  onSlidesChange,
  onSlideFileChange,
  onFileError,
  variant = "banner",
}: BannerSlidesEditorProps) {
  const isOffers = variant === "offers";
  const newSlide = () => (isOffers ? defaultOffersSlide() : defaultBannerSlide());

  const updateSlide = (index: number, patch: Partial<BannerSlide>) => {
    onSlidesChange(slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)));
  };

  const addSlide = () => {
    onSlidesChange([...slides, newSlide()]);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    onSlidesChange(slides.filter((_, i) => i !== index));
    onSlideFileChange(index, null);
    onFileError(index, null);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      onSlideFileChange(index, null);
      onFileError(index, null);
      return;
    }

    const validationError = validateAppHomeBannerImage(file);
    if (validationError) {
      onSlideFileChange(index, null);
      onFileError(index, validationError);
      e.target.value = "";
      return;
    }

    onFileError(index, null);
    onSlideFileChange(index, file);
  };

  return (
    <div className="space-y-4">
      {slides.map((slide, index) => (
        <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">{isOffers ? "Offer" : "Banner"} {index + 1}</p>
            {slides.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-red-600 hover:text-red-700"
                onClick={() => removeSlide(index)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>

          <Field label="Lottie animation URL (optional)">
            <input
              value={slide.bannerLottie ?? ""}
              onChange={(e) => updateSlide(index, { bannerLottie: e.target.value })}
              className="field-input"
              placeholder="https://lottie.host/…/animation.json"
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste a Lottie JSON URL from LottieFiles. When set, the app plays this animation in the banner carousel (image is optional fallback).
            </p>
          </Field>

          <Field label="Banner Image">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(index, e)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Max {APP_HOME_BANNER_MAX_SIZE_MB}MB · JPG, PNG, WEBP · optional if Lottie URL is set
            </p>
            {slideFiles[index] && (
              <p className="mt-1 text-xs text-gray-600">
                Selected: {slideFiles[index].name} ({(slideFiles[index].size / (1024 * 1024)).toFixed(2)}MB)
              </p>
            )}
            {fileErrors[index] && (
              <p className="mt-1 text-xs text-red-600">{fileErrors[index]}</p>
            )}
            {slide.bannerImage && (
              <img src={slide.bannerImage} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
            )}
          </Field>

          <Field label="Display Title">
            <input
              value={slide.title}
              onChange={(e) => updateSlide(index, { title: e.target.value })}
              className="field-input"
              placeholder={isOffers ? "Festive Offers" : "30% OFF YOUR FIRST ORDER"}
            />
          </Field>

          {!isOffers && (
            <Field label="CTA Text">
              <input
                value={slide.ctaText}
                onChange={(e) => updateSlide(index, { ctaText: e.target.value })}
                className="field-input"
                placeholder="Shop Now"
              />
            </Field>
          )}

          <Field label="Tap Action">
            <select
              value={slide.actionType}
              onChange={(e) => updateSlide(index, { actionType: e.target.value, actionTarget: "" })}
              className="field-input"
            >
              <option value="category">Category page</option>
              <option value="product">Product page</option>
              <option value="offer">Coupons / offers</option>
              <option value="subscription">Subscriptions</option>
              <option value="menu">Full menu</option>
              <option value="external">External URL</option>
            </select>
          </Field>

          <Field label={slide.actionType === "external" ? "External URL" : "Action Target"}>
            {slide.actionType === "category" ? (
              <select
                value={slide.actionTarget}
                onChange={(e) => updateSlide(index, { actionTarget: e.target.value })}
                className="field-input"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            ) : slide.actionType === "menu" ? (
              <input value="Opens full menu" className="field-input bg-gray-50" readOnly />
            ) : slide.actionType === "offer" || slide.actionType === "subscription" ? (
              <input
                value={slide.actionType === "offer" ? "Opens coupons page" : "Opens subscriptions"}
                className="field-input bg-gray-50"
                readOnly
              />
            ) : (
              <input
                value={slide.actionType === "external" ? (slide.actionUrl ?? slide.actionTarget) : slide.actionTarget}
                onChange={(e) =>
                  updateSlide(
                    index,
                    slide.actionType === "external"
                      ? { actionUrl: e.target.value, actionTarget: e.target.value }
                      : { actionTarget: e.target.value },
                  )
                }
                className="field-input"
                placeholder={
                  slide.actionType === "external"
                    ? "https://example.com"
                    : slide.actionType === "product"
                      ? "Product slug or ID"
                      : "Target ID or URL"
                }
              />
            )}
          </Field>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addSlide} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add {isOffers ? "Offer Banner" : "Banner"}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}
