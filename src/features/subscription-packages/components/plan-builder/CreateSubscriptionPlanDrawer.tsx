"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extract-api-error";
import { foodItemApi } from "@/lib/api/food.api";
import { deliverySlotsApi, type DeliverySlot } from "@/lib/api/delivery-slots.api";
import type { ApiFoodItem } from "@/lib/types/api";
import type { SubscriptionPackage } from "../../types/subscription-package";
import {
  defaultPlanRules,
  durationOptionsFromLegacy,
  emptyPlanBuilderForm,
  getDefaultDurationOption,
  normalizeDurationOptionsForSave,
  type PlanBuilderForm,
  type PlanBuilderPayload,
  type Weekday,
} from "../../types/plan-builder";
import {
  expandPlanBuilderConfigForApi,
  normalizePlanBuilderConfig,
} from "../../utils/plan-builder-schedule.util";
import { planBuilderApi } from "../../services/plan-builder.api";
import { CollapsibleSection } from "./CollapsibleSection";
import { ConfigureMealDrawer } from "./ConfigureMealDrawer";
import { MealOptionsSection } from "./MealOptionsSection";
import { MealScheduleSection } from "./MealScheduleSection";
import { PlanDetailsSection } from "./PlanDetailsSection";
import { PlanRulesSection } from "./PlanRulesSection";
import {
  formatValidationSummary,
  getExpandedSectionsForErrors,
  getMealOptionsSectionError,
  getScheduleSectionError,
  mergeExpandedSections,
  validateForPublish,
} from "./validation";

interface CreateSubscriptionPlanDrawerProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  selected: SubscriptionPackage | null;
  onClose: () => void;
  onSaved: () => void;
}

function packageToForm(pkg: SubscriptionPackage): PlanBuilderForm {
  const config = (pkg.planBuilderConfig ?? {}) as PlanBuilderForm["config"];
  const durationOptions = normalizeDurationOptionsForSave(
    config.durationOptions?.length
      ? config.durationOptions
      : durationOptionsFromLegacy(pkg.durationValue ?? pkg.validityDays ?? 30),
  );
  const defaultTier = getDefaultDurationOption(durationOptions);
  return {
    planName: pkg.name,
    description: pkg.description ?? "",
    planImageUrl: pkg.planImageUrl ?? "",
    durationValue: defaultTier?.days ?? pkg.durationValue ?? pkg.validityDays ?? 30,
    durationUnit: (pkg.durationUnit as PlanBuilderForm["durationUnit"]) ?? "DAYS",
    status: (pkg.publishStatus as PlanBuilderForm["status"]) ?? (pkg.active ? "ACTIVE" : "DRAFT"),
    config: normalizePlanBuilderConfig({
      mealOptions: config.mealOptions ?? [],
      rules: { ...defaultPlanRules(), ...(config.rules ?? {}) },
      durationOptions,
    }),
  };
}

function formToPayload(form: PlanBuilderForm, publish: boolean): PlanBuilderPayload {
  const durationOptions = normalizeDurationOptionsForSave(form.config.durationOptions ?? []);
  const defaultTier = getDefaultDurationOption(durationOptions);
  return {
    name: form.planName.trim(),
    description: form.description.trim() || undefined,
    planImageUrl: form.planImageUrl.trim() || undefined,
    durationValue: defaultTier?.days ?? form.durationValue,
    durationUnit: form.durationUnit,
    publishStatus: publish ? "ACTIVE" : form.status,
    planBuilderConfig: expandPlanBuilderConfigForApi({
      ...form.config,
      durationOptions,
    }),
    publish,
  };
}

export function CreateSubscriptionPlanDrawer({
  open,
  mode,
  selected,
  onClose,
  onSaved,
}: CreateSubscriptionPlanDrawerProps) {
  const [form, setForm] = useState<PlanBuilderForm>(emptyPlanBuilderForm());
  const [planId, setPlanId] = useState<string | null>(null);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [products, setProducts] = useState<ApiFoodItem[]>([]);
  const [expanded, setExpanded] = useState({
    details: true,
    mealOptions: false,
    schedule: false,
    rules: false,
  });
  const [configureTarget, setConfigureTarget] = useState<{ mealOptionId: string; day: Weekday } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [planImageFile, setPlanImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isViewOnly = mode === "view";

  const showError = useCallback((message: string) => {
    setGlobalError(message);
    toast.error(message, { duration: 6000 });
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    setGlobalError(null);
    setErrors({});
    setForm(selected ? packageToForm(selected) : emptyPlanBuilderForm());
    setPlanId(selected?.id ?? null);
    setPlanImageFile(null);
    setExpanded({ details: true, mealOptions: false, schedule: false, rules: false });

    Promise.all([
      deliverySlotsApi.list().then((slots) => setDeliverySlots(slots.filter((s) => s.isActive))),
      foodItemApi.list({ limit: 300, isAvailable: true }).then((res) => setProducts(res.data?.items ?? [])),
    ]).catch(() => {});
  }, [open, selected]);

  const toggleSection = (key: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const configureMealOption = useMemo(() => {
    if (!configureTarget) return null;
    return form.config.mealOptions.find((o) => o.id === configureTarget.mealOptionId) ?? null;
  }, [configureTarget, form.config.mealOptions]);

  const configureMealOptionIndex = useMemo(() => {
    if (!configureTarget) return 0;
    return form.config.mealOptions.findIndex((o) => o.id === configureTarget.mealOptionId);
  }, [configureTarget, form.config.mealOptions]);

  const saveDayDefaults = useCallback(
    (defaults: Record<string, string>) => {
      if (!configureTarget) return;
      setForm((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          mealOptions: prev.config.mealOptions.map((option) => {
            if (option.id !== configureTarget.mealOptionId) return option;
            return {
              ...option,
              weeklySchedule: option.weeklySchedule.map((day) =>
                day.day === configureTarget.day ? { ...day, defaults } : day,
              ),
            };
          }),
        },
      }));
    },
    [configureTarget],
  );

  const persist = async (publish: boolean) => {
    if (isViewOnly) return;

    if (publish) {
      const validationErrors = validateForPublish(form);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length) {
        const summary = formatValidationSummary(validationErrors);
        showError(summary);
        setExpanded((prev) => mergeExpandedSections(prev, getExpandedSectionsForErrors(validationErrors)));
        return;
      }
    } else {
      setErrors({});
    }

    if (!form.planName.trim()) {
      const message = "Plan name is required";
      setErrors({ planName: message });
      setExpanded((prev) => ({ ...prev, details: true }));
      showError(message);
      return;
    }

    setSaving(true);
    setGlobalError(null);
    try {
      const payload = formToPayload(form, publish);
      let savedPlanId = planId;

      if (savedPlanId) {
        await planBuilderApi.save(savedPlanId, payload);
      } else {
        const created = await planBuilderApi.create(payload);
        savedPlanId = created.id;
        setPlanId(created.id);
      }

      if (planImageFile && savedPlanId) {
        setImageUploading(true);
        await planBuilderApi.uploadPlanImage(savedPlanId, planImageFile);
        setPlanImageFile(null);
      }

      toast.success(publish ? "Plan published" : "Draft saved");
      onSaved();
      onClose();
    } catch (err) {
      const message = extractApiError(err, publish ? "Failed to publish plan" : "Failed to save draft");
      showError(message);
    } finally {
      setSaving(false);
      setImageUploading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
        <div className="flex h-full w-full max-w-[680px] flex-col bg-white shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {mode === "create"
                    ? "Create Subscription Plan"
                    : mode === "edit"
                      ? "Edit Subscription Plan"
                      : "View Subscription Plan"}
                </h2>
                <p className="text-sm text-gray-500">Configure plan details, meal options, schedules, and rules</p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {globalError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <p className="font-semibold">Action required</p>
                <p className="mt-1">{globalError}</p>
              </div>
            )}

            <CollapsibleSection
              title="Plan Details"
              expanded={expanded.details}
              onToggle={() => toggleSection("details")}
              error={errors.planName || errors.durationOptions}
            >
              <PlanDetailsSection
                form={form}
                disabled={isViewOnly}
                errors={errors}
                imageUploading={imageUploading}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                onConfigChange={(configPatch) =>
                  setForm((prev) => ({
                    ...prev,
                    config: { ...prev.config, ...configPatch },
                  }))
                }
                onImageFileSelect={setPlanImageFile}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Meal Options & Pricing"
              expanded={expanded.mealOptions}
              onToggle={() => toggleSection("mealOptions")}
              error={getMealOptionsSectionError(errors)}
            >
              <MealOptionsSection
                config={form.config}
                deliverySlots={deliverySlots}
                products={products}
                disabled={isViewOnly}
                errors={errors}
                onChange={(config) => setForm((prev) => ({ ...prev, config }))}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Meal Schedule"
              expanded={expanded.schedule}
              onToggle={() => toggleSection("schedule")}
              error={getScheduleSectionError(errors)}
            >
              <MealScheduleSection
                config={form.config}
                disabled={isViewOnly}
                errors={errors}
                onConfigureMeal={(mealOptionId, day) => setConfigureTarget({ mealOptionId, day })}
                onChange={(config) => setForm((prev) => ({ ...prev, config }))}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Plan Rules"
              expanded={expanded.rules}
              onToggle={() => toggleSection("rules")}
            >
              <PlanRulesSection
                rules={form.config.rules}
                disabled={isViewOnly}
                onChange={(rules) =>
                  setForm((prev) => ({ ...prev, config: { ...prev.config, rules } }))
                }
              />
            </CollapsibleSection>
          </div>

          {!isViewOnly && (
            <div className="sticky bottom-0 shrink-0 border-t border-gray-200 bg-white">
              {globalError && (
                <div
                  role="alert"
                  className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700"
                >
                  {globalError}
                </div>
              )}
              <div className="flex items-center justify-end gap-2 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => persist(false)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => persist(true)}
                className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {saving ? "Publishing…" : "Publish Plan"}
              </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfigureMealDrawer
        open={!!configureTarget}
        mealOption={configureMealOption}
        mealOptionIndex={configureMealOptionIndex}
        day={configureTarget?.day ?? null}
        products={products}
        disabled={isViewOnly}
        errors={errors}
        onClose={() => setConfigureTarget(null)}
        onSave={saveDayDefaults}
      />
    </>
  );
}
