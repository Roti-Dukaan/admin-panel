"use client";

import { SubscriptionPlan, SeoConfig } from "@/features/subscription-plans/types/subscription-plan";
import { Globe, Image } from "lucide-react";

interface SeoTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<SeoConfig>) => void;
}

export function SeoTab({ plan, isViewOnly, onUpdate }: SeoTabProps) {
  const seo = plan.seo;

  return (
    <div className="space-y-8">
      {/* Plan URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Plan URL</label>
        <div className="flex items-center gap-0">
          <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 h-11">
            <Globe className="h-4 w-4" />
          </span>
          <span className="inline-flex items-center rounded-l-none rounded-r-none border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 h-11">
            rotidukaan.com
          </span>
          <input
            type="text"
            value={seo.planUrl}
            onChange={(e) => onUpdate({ planUrl: e.target.value })}
            disabled={isViewOnly}
            placeholder="/plans/plan-name"
            className="h-11 flex-1 rounded-r-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* Meta Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Meta Title</label>
        <input
          type="text"
          value={seo.metaTitle}
          onChange={(e) => onUpdate({ metaTitle: e.target.value })}
          disabled={isViewOnly}
          placeholder="Page title for search engines"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-400">{seo.metaTitle.length}/60 characters</p>
          {seo.metaTitle.length > 60 && (
            <p className="text-xs text-amber-500 font-medium">Title may be truncated in search results</p>
          )}
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Meta Description</label>
        <textarea
          value={seo.metaDescription}
          onChange={(e) => onUpdate({ metaDescription: e.target.value })}
          disabled={isViewOnly}
          rows={3}
          placeholder="Brief description for search engine results"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-400">{seo.metaDescription.length}/160 characters</p>
          {seo.metaDescription.length > 160 && (
            <p className="text-xs text-amber-500 font-medium">Description may be truncated</p>
          )}
        </div>
      </div>

      {/* OG Image Placeholder */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Open Graph Image</label>
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center hover:border-gray-300 transition-colors">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <Image className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
          <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 2MB. Recommended: 1200x630px</p>
          {seo.ogImageUrl && (
            <p className="mt-3 text-xs text-gray-500">Current: {seo.ogImageUrl}</p>
          )}
        </div>
      </div>

      {/* SEO Preview */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Search Preview
        </label>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-base font-medium text-blue-700 hover:underline cursor-pointer">
            {seo.metaTitle || plan.name}
          </p>
          <p className="mt-0.5 text-sm text-green-700">
            rotidukaan.com{seo.planUrl}
          </p>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {seo.metaDescription || plan.shortDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
