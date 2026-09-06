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
} from "@/features/app-home-page/types/app-home-page";
import { defaultConfigForType, sectionTypeLabel, APP_HOME_BANNER_MAX_SIZE_MB, validateAppHomeBannerImage } from "@/features/app-home-page/types/app-home-page";
import { CategoryPickerDialog } from "./CategoryPickerDialog";
import { ProductPickerDialog } from "./ProductPickerDialog";

interface SectionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionType: AppHomePageSectionType;
  section?: AppHomePageSection | null;
  saving?: boolean;
  saveError?: string | null;
  onSave: (payload: AppHomePageSectionForm, bannerImage?: File | null) => Promise<void>;
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
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerFileError, setBannerFileError] = useState<string | null>(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBannerFile(null);
    setBannerFileError(null);
    if (section) {
      setTitle(section.title ?? String(section.config?.title ?? ""));
      setConfig({ ...defaultConfigForType(section.sectionType), ...section.config });
      setIsActive(section.isActive);
      setStartAt(section.startAt ? toLocalInput(section.startAt) : "");
      setEndAt(section.endAt ? toLocalInput(section.endAt) : "");
      setTargetLocations(Array.isArray(section.targetLocations) ? section.targetLocations : []);
    } else {
      setTitle("");
      setConfig(defaultConfigForType(sectionType));
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

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setBannerFile(null);
      setBannerFileError(null);
      return;
    }

    const validationError = validateAppHomeBannerImage(file);
    if (validationError) {
      setBannerFile(null);
      setBannerFileError(validationError);
      e.target.value = "";
      return;
    }

    setBannerFileError(null);
    setBannerFile(file);
  };

  const handleSubmit = async (publish: boolean) => {
    if (bannerFileError) return;
    const payload: AppHomePageSectionForm = {
      sectionType: section?.sectionType ?? sectionType,
      title: title || undefined,
      config: {
        ...config,
        title: config.title ?? title,
      },
      isActive: publish ? isActive : false,
      startAt: startAt ? new Date(startAt).toISOString() : undefined,
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      targetLocations,
    };
    await onSave(payload, bannerFile);
  };

  const needsBannerImage = sectionType === "BANNER" || sectionType === "OFFERS";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit" : "Create"} {sectionTypeLabel(sectionType)} Section</DialogTitle>
          </DialogHeader>

          {(saveError || bannerFileError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {bannerFileError ?? saveError}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Section Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="field-input" placeholder="Weekend Sale" />
            </Field>

            {needsBannerImage && (
              <Field label="Banner Image">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleBannerFileChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Max {APP_HOME_BANNER_MAX_SIZE_MB}MB · JPG, PNG, WEBP
                </p>
                {bannerFile && (
                  <p className="mt-1 text-xs text-gray-600">
                    Selected: {bannerFile.name} ({(bannerFile.size / (1024 * 1024)).toFixed(2)}MB)
                  </p>
                )}
                {String(config.bannerImage ?? "") && (
                  <img src={String(config.bannerImage)} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
                )}
              </Field>
            )}

            {(sectionType === "BANNER" || sectionType === "OFFERS") && (
              <>
                <Field label="Display Title">
                  <input
                    value={String(config.title ?? "")}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    className="field-input"
                  />
                </Field>
                {sectionType === "BANNER" && (
                  <Field label="CTA Text">
                    <input
                      value={String(config.ctaText ?? "")}
                      onChange={(e) => updateConfig({ ctaText: e.target.value })}
                      className="field-input"
                    />
                  </Field>
                )}
                <Field label="Tap Action">
                  <select
                    value={String(config.actionType ?? (sectionType === "OFFERS" ? "offer" : "category"))}
                    onChange={(e) => updateConfig({ actionType: e.target.value, actionTarget: "" })}
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
                <Field label={String(config.actionType) === "external" ? "External URL" : "Action Target"}>
                  {String(config.actionType) === "category" ? (
                    <select
                      value={String(config.actionTarget ?? "")}
                      onChange={(e) => updateConfig({ actionTarget: e.target.value })}
                      className="field-input"
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  ) : String(config.actionType) === "menu" ? (
                    <input value="Opens full menu" className="field-input bg-gray-50" readOnly />
                  ) : String(config.actionType) === "offer" || String(config.actionType) === "subscription" ? (
                    <input
                      value={String(config.actionType) === "offer" ? "Opens coupons page" : "Opens subscriptions"}
                      className="field-input bg-gray-50"
                      readOnly
                    />
                  ) : (
                    <input
                      value={String(config.actionTarget ?? config.actionUrl ?? "")}
                      onChange={(e) =>
                        updateConfig(
                          String(config.actionType) === "external"
                            ? { actionUrl: e.target.value, actionTarget: e.target.value }
                            : { actionTarget: e.target.value },
                        )
                      }
                      className="field-input"
                      placeholder={
                        String(config.actionType) === "external"
                          ? "https://example.com"
                          : String(config.actionType) === "product"
                            ? "Product slug or ID"
                            : "Target ID or URL"
                      }
                    />
                  )}
                </Field>
              </>
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
            <Button type="button" variant="outline" disabled={saving || !!bannerFileError} onClick={() => void handleSubmit(false)}>Save Draft</Button>
            <Button type="button" disabled={saving || !!bannerFileError} onClick={() => void handleSubmit(true)}>
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
