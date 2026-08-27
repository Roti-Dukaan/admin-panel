"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { foodItemApi } from "@/lib/api/food.api";
import { deliverySlotsApi, type DeliverySlot } from "@/lib/api/delivery-slots.api";
import type { ApiFoodItem } from "@/lib/types/api";
import type { SubscriptionPackage } from "../../types/subscription-package";
import {
  defaultPlanRules,
  emptyPlanBuilderForm,
  emptyWeeklySchedule,
  type PlanBuilderForm,
  type PlanBuilderPayload,
  type Weekday,
} from "../../types/plan-builder";
import { planBuilderApi } from "../../services/plan-builder.api";
import { CollapsibleSection } from "./CollapsibleSection";
import { ConfigureMealDrawer } from "./ConfigureMealDrawer";
import { MealOptionsSection } from "./MealOptionsSection";
import { MealScheduleSection } from "./MealScheduleSection";
import { PlanDetailsSection } from "./PlanDetailsSection";
import { PlanRulesSection } from "./PlanRulesSection";
import { validateForPublish } from "./validation";

interface CreateSubscriptionPlanDrawerProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  selected: SubscriptionPackage | null;
  onClose: () => void;
  onSaved: () => void;
}

function packageToForm(pkg: SubscriptionPackage): PlanBuilderForm {
  const config = (pkg.planBuilderConfig ?? {}) as PlanBuilderForm["config"];
  return {
    planName: pkg.name,
    description: pkg.description ?? "",
    planImageUrl: pkg.planImageUrl ?? "",
    durationValue: pkg.durationValue ?? pkg.validityDays ?? 30,
    durationUnit: (pkg.durationUnit as PlanBuilderForm["durationUnit"]) ?? "DAYS",
    status: (pkg.publishStatus as PlanBuilderForm["status"]) ?? (pkg.active ? "ACTIVE" : "DRAFT"),
    config: {
      mealOptions: (config.mealOptions ?? []).map((o) => ({
        ...o,
        weeklySchedule: o.weeklySchedule?.length ? o.weeklySchedule : emptyWeeklySchedule(),
      })),
      rules: { ...defaultPlanRules(), ...(config.rules ?? {}) },
    },
  };
}

function formToPayload(form: PlanBuilderForm, publish: boolean): PlanBuilderPayload {
  return {
    name: form.planName.trim(),
    description: form.description.trim() || undefined,
    planImageUrl: form.planImageUrl.trim() || undefined,
    durationValue: form.durationValue,
    durationUnit: form.durationUnit,
    publishStatus: publish ? "ACTIVE" : form.status,
    planBuilderConfig: form.config,
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

  const isViewOnly = mode === "view";

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

  const saveMealGroups = useCallback(
    (mealGroups: PlanBuilderForm["config"]["mealOptions"][0]["weeklySchedule"][0]["mealGroups"]) => {
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
                day.day === configureTarget.day ? { ...day, mealGroups } : day,
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
        setGlobalError("Fix validation errors before publishing");
        return;
      }
    } else {
      setErrors({});
    }

    if (!form.planName.trim()) {
      setGlobalError("Plan name is required");
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

      onSaved();
      onClose();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to save plan";
      setGlobalError(String(message));
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

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {globalError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {globalError}
              </div>
            )}

            <CollapsibleSection
              title="Plan Details"
              expanded={expanded.details}
              onToggle={() => toggleSection("details")}
              error={errors.planName || errors.durationValue}
            >
              <PlanDetailsSection
                form={form}
                disabled={isViewOnly}
                errors={errors}
                imageUploading={imageUploading}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                onImageFileSelect={setPlanImageFile}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Meal Options & Pricing"
              expanded={expanded.mealOptions}
              onToggle={() => toggleSection("mealOptions")}
              error={errors.mealOptions}
            >
              <MealOptionsSection
                config={form.config}
                deliverySlots={deliverySlots}
                disabled={isViewOnly}
                errors={errors}
                onChange={(config) => setForm((prev) => ({ ...prev, config }))}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Meal Schedule"
              expanded={expanded.schedule}
              onToggle={() => toggleSection("schedule")}
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
            <div className="sticky bottom-0 flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 bg-white px-6 py-4">
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
        onSave={saveMealGroups}
      />
    </>
  );
}
