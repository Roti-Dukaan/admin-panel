"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { citiesApi, type City } from "@/lib/api/master-data/cities.api";
import { categoryApi } from "@/lib/api/category.api";
import type { ApiCategory } from "@/lib/types/api";
import type {
  AppHomePageSection,
  AppHomePageSectionForm,
  AppHomePageSectionType,
  BannerSlide,
  BannerUploadFiles,
} from "@/features/app-home-page/types/app-home-page";
import { defaultConfigForType, normalizeBannerSlides, bannerConfigFromSlides, sectionTypeLabel } from "@/features/app-home-page/types/app-home-page";
import { BannerSlidesEditor } from "./BannerSlidesEditor";
import { CategoryPickerDialog } from "./CategoryPickerDialog";
import { ProductPickerDialog } from "./ProductPickerDialog";

interface SectionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionType: AppHomePageSectionType;
  section?: AppHomePageSection | null;
  saving?: boolean;
  saveError?: string | null;
  onSave: (payload: AppHomePageSectionForm, files?: BannerUploadFiles) => Promise<void>;
}

export function SectionEditorDialog({
  open,
  onOpenChange,
  sectionType,
  section,
  saving,
  saveError,
  onSave,
}: SectionEditorDialogProps) {
  const isEdit = !!section;
  const [title, setTitle] = useState("");
  const [config, setConfig] = useState<Record<string, unknown>>(defaultConfigForType(sectionType));
  const [isActive, setIsActive] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [targetLocations, setTargetLocations] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>([]);
  const [bannerSlideFiles, setBannerSlideFiles] = useState<Record<number, File>>({});
  const [bannerSlideFileErrors, setBannerSlideFileErrors] = useState<Record<number, string>>({});
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBannerSlideFiles({});
    setBannerSlideFileErrors({});
    if (section) {
      setTitle(section.title ?? String(section.config?.title ?? ""));
      const mergedConfig = { ...defaultConfigForType(section.sectionType), ...section.config };
      setConfig(mergedConfig);
      setBannerSlides(normalizeBannerSlides(mergedConfig));
      setIsActive(section.isActive);
      setStartAt(section.startAt ? toLocalInput(section.startAt) : "");
      setEndAt(section.endAt ? toLocalInput(section.endAt) : "");
      setTargetLocations(Array.isArray(section.targetLocations) ? section.targetLocations : []);
    } else {
      setTitle("");
      setConfig(defaultConfigForType(sectionType));
      setBannerSlides(normalizeBannerSlides(defaultConfigForType(sectionType)));
      setIsActive(true);
      setStartAt("");
      setEndAt("");
      setTargetLocations([]);
    }
  }, [open, section, sectionType]);

  useEffect(() => {
    if (!open) return;
    citiesApi.getAllActive().then((res) => setCities(res.data?.data ?? [])).catch(() => setCities([]));
    categoryApi.list({ limit: 100, status: 'active', sort: 'displayOrder', order: 'asc' }).then((res) => setCategories(res.data?.items ?? [])).catch(() => setCategories([]));
  }, [open]);

  const productIds = useMemo(() => (config.productIds as string[] | undefined) ?? [], [config.productIds]);
  const categoryIds = useMemo(() => (config.categoryIds as string[] | undefined) ?? [], [config.categoryIds]);

  const updateConfig = (patch: Record<string, unknown>) => setConfig((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (publish: boolean) => {
    if (Object.keys(bannerSlideFileErrors).length > 0) return;

    const activeType = section?.sectionType ?? sectionType;
    const isMultiSlideSection = activeType === "BANNER" || activeType === "OFFERS";
    const nextConfig = isMultiSlideSection
      ? bannerConfigFromSlides(bannerSlides)
      : {
          ...config,
          title: config.title ?? title,
        };

    const payload: AppHomePageSectionForm = {
      sectionType: section?.sectionType ?? sectionType,
      title: title || undefined,
      config: nextConfig,
      isActive: publish ? isActive : false,
      startAt: startAt ? new Date(startAt).toISOString() : undefined,
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      targetLocations,
    };

    const files: BannerUploadFiles | undefined = isMultiSlideSection
      ? { bannerSlideFiles: bannerSlideFiles }
      : undefined;

    await onSave(payload, files);
  };

  const isMultiSlideSection = sectionType === "BANNER" || sectionType === "OFFERS";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit" : "Create"} {sectionTypeLabel(sectionType)} Section</DialogTitle>
          </DialogHeader>

          {(saveError || Object.keys(bannerSlideFileErrors).length > 0) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {Object.values(bannerSlideFileErrors)[0] ?? saveError}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Section Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="field-input" placeholder="Weekend Sale" />
            </Field>

            {isMultiSlideSection && (
              <BannerSlidesEditor
                slides={bannerSlides}
                categories={categories}
                slideFiles={bannerSlideFiles}
                fileErrors={bannerSlideFileErrors}
                variant={sectionType === "OFFERS" ? "offers" : "banner"}
                onSlidesChange={setBannerSlides}
                onSlideFileChange={(index, file) => {
                  setBannerSlideFiles((prev) => {
                    const next = { ...prev };
                    if (file) next[index] = file;
                    else delete next[index];
                    return next;
                  });
                }}
                onFileError={(index, error) => {
                  setBannerSlideFileErrors((prev) => {
                    const next = { ...prev };
                    if (error) next[index] = error;
                    else delete next[index];
                    return next;
                  });
                }}
              />
            )}

            {sectionType === "CATEGORY_GRID" && (
              <>
                <Field label="Categories">
                  <Button type="button" variant="outline" onClick={() => setCategoryPickerOpen(true)}>
                    Select Categories ({categoryIds.length})
                  </Button>
                </Field>
                <Field label="Max Items">
                  <input
                    type="number"
                    value={Number(config.maxItems ?? 8)}
                    onChange={(e) => updateConfig({ maxItems: Number(e.target.value) })}
                    className="field-input"
                  />
                </Field>
              </>
            )}

            {(sectionType === "PRODUCT_CAROUSEL" || sectionType === "PRODUCT_GRID") && (
              <>
                <Field label="Carousel Title">
                  <input
                    value={String(config.title ?? "")}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    className="field-input"
                  />
                </Field>
                <Field label="Products">
                  <Button type="button" variant="outline" onClick={() => setProductPickerOpen(true)}>
                    Select Products ({productIds.length})
                  </Button>
                </Field>
                <Field label="Max Items">
                  <input
                    type="number"
                    value={Number(config.maxItems ?? 6)}
                    onChange={(e) => updateConfig({ maxItems: Number(e.target.value) })}
                    className="field-input"
                  />
                </Field>
              </>
            )}

            {sectionType === "PRICE_BAND" && (
              <>
                <Field label="Title">
                  <input
                    value={String(config.title ?? "")}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    className="field-input"
                  />
                </Field>
                <Field label="Price Band (₹)">
                  <input
                    type="number"
                    value={Number(config.priceBand ?? 99)}
                    onChange={(e) => updateConfig({ priceBand: Number(e.target.value) })}
                    className="field-input"
                  />
                </Field>
                <Field label="Products (optional override)">
                  <Button type="button" variant="outline" onClick={() => setProductPickerOpen(true)}>
                    Select Products ({productIds.length})
                  </Button>
                </Field>
                <Field label="Max Items">
                  <input
                    type="number"
                    value={Number(config.maxItems ?? 8)}
                    onChange={(e) => updateConfig({ maxItems: Number(e.target.value) })}
                    className="field-input"
                  />
                </Field>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start">
                <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="field-input" />
              </Field>
              <Field label="End">
                <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="field-input" />
              </Field>
            </div>

            <Field label="Target Locations">
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <label key={city.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={targetLocations.includes(city.name)}
                      onChange={(e) => {
                        setTargetLocations((prev) =>
                          e.target.checked ? [...prev, city.name] : prev.filter((n) => n !== city.name),
                        );
                      }}
                    />
                    {city.name}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Status">
              <label className="mr-4 inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={isActive} onChange={() => setIsActive(true)} /> Active
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={!isActive} onChange={() => setIsActive(false)} /> Draft
              </label>
            </Field>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="button" variant="outline" disabled={saving || Object.keys(bannerSlideFileErrors).length > 0} onClick={() => void handleSubmit(false)}>Save Draft</Button>
            <Button type="button" disabled={saving || Object.keys(bannerSlideFileErrors).length > 0} onClick={() => void handleSubmit(true)}>
              {saving ? "Saving..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductPickerDialog
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        selectedIds={productIds}
        onDone={(ids, products) =>
          updateConfig({
            productIds: ids,
            products: products.map((p) => ({
              productId: p.id,
              name: p.name,
              price: p.discountPrice ?? p.basePrice,
              image: p.imageUrl,
            })),
          })
        }
      />

      <CategoryPickerDialog
        open={categoryPickerOpen}
        onOpenChange={setCategoryPickerOpen}
        selectedIds={categoryIds}
        onDone={(ids, cats) =>
          updateConfig({
            categoryIds: ids,
            categories: cats.map((c) => ({
              categoryId: c.id,
              name: c.name,
              icon: c.imageUrl,
            })),
          })
        }
      />

      <style jsx global>{`
        .field-input {
          width: 100%;
          height: 2.5rem;
          border-radius: 0.75rem;
          border: 1px solid rgb(229 231 235);
          padding: 0 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </>
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

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
