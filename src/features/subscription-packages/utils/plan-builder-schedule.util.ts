import {
  WEEKDAYS,
  createId,
  emptyMealGroupTemplate,
  type DayScheduleConfig,
  type MealGroupConfig,
  type MealGroupTemplate,
  type MealOptionConfig,
  type PlanBuilderConfig,
  type Weekday,
} from "../types/plan-builder";

function emptyDefaults(): Record<string, string> {
  return {};
}

function defaultForGroup(template: MealGroupTemplate): string {
  return template.allowedProductIds[0] ?? "";
}

/** Ensure each delivery day has a defaults map aligned with universal meal groups. */
export function syncDayDefaults(option: MealOptionConfig): MealOptionConfig {
  const mealGroups = option.mealGroups ?? [];
  const weeklySchedule = (option.weeklySchedule ?? []).map((day) => {
    const defaults = { ...(day.defaults ?? {}) };
    for (const group of mealGroups) {
      const current = defaults[group.id];
      if (!current || !group.allowedProductIds.includes(current)) {
        defaults[group.id] = defaultForGroup(group);
      }
    }
    for (const key of Object.keys(defaults)) {
      if (!mealGroups.some((g) => g.id === key)) delete defaults[key];
    }
    return { ...day, defaults };
  });
  return { ...option, mealGroups, weeklySchedule };
}

/** Convert legacy per-day mealGroups into universal templates + per-day defaults. */
export function normalizeMealOption(option: MealOptionConfig): MealOptionConfig {
  if (option.mealGroups?.length) {
    return syncDayDefaults({
      ...option,
      weeklySchedule: (option.weeklySchedule ?? []).map((day) => ({
        day: day.day,
        deliveryEnabled: day.deliveryEnabled,
        defaults: day.defaults ?? {},
      })),
    });
  }

  const referenceDay =
    option.weeklySchedule?.find((d) => d.deliveryEnabled && (d.mealGroups?.length ?? 0) > 0) ??
    option.weeklySchedule?.find((d) => (d.mealGroups?.length ?? 0) > 0);

  const mealGroups: MealGroupTemplate[] = (referenceDay?.mealGroups ?? []).map((group) => ({
    id: group.id || createId(),
    groupName: group.groupName,
    selectionRule: group.selectionRule,
    allowedProductIds: [...(group.allowedProductIds ?? [])],
    quantity: group.quantity ?? 1,
    includedQuantity: group.includedQuantity ?? group.quantity ?? 1,
    maximumQuantity: group.maximumQuantity ?? group.quantity ?? 1,
    allowPaidExtras: group.allowPaidExtras,
    extraUnitPrice: group.extraUnitPrice ?? null,
  }));

  const weeklySchedule: DayScheduleConfig[] = (option.weeklySchedule ?? []).map((day) => {
    const defaults: Record<string, string> = { ...(day.defaults ?? {}) };
    for (const group of day.mealGroups ?? []) {
      if (group.id && group.defaultProductId) {
        defaults[group.id] = group.defaultProductId;
      }
    }
    return {
      day: day.day,
      deliveryEnabled: day.deliveryEnabled,
      defaults,
    };
  });

  return syncDayDefaults({ ...option, mealGroups, weeklySchedule });
}

export function normalizePlanBuilderConfig(config: PlanBuilderConfig): PlanBuilderConfig {
  return {
    ...config,
    mealOptions: (config.mealOptions ?? []).map(normalizeMealOption),
  };
}

/** Expand universal groups + per-day defaults into legacy per-day mealGroups for API storage. */
export function expandMealOptionForApi(option: MealOptionConfig): MealOptionConfig {
  const synced = syncDayDefaults(option);
  const weeklySchedule = synced.weeklySchedule.map((day) => {
    if (!day.deliveryEnabled) {
      return { day: day.day, deliveryEnabled: false, mealGroups: [] as MealGroupConfig[], defaults: day.defaults };
    }
    const mealGroups: MealGroupConfig[] = synced.mealGroups.map((template) => ({
      ...template,
      defaultProductId: day.defaults?.[template.id] || defaultForGroup(template),
    }));
    return { day: day.day, deliveryEnabled: true, defaults: day.defaults, mealGroups };
  });
  return { ...synced, weeklySchedule };
}

export function expandPlanBuilderConfigForApi(config: PlanBuilderConfig): PlanBuilderConfig {
  return {
    ...config,
    mealOptions: (config.mealOptions ?? []).map(expandMealOptionForApi),
  };
}

export function emptyWeeklyScheduleWithDefaults(): DayScheduleConfig[] {
  return WEEKDAYS.map(({ key }) => ({
    day: key,
    deliveryEnabled: key !== "sun",
    defaults: emptyDefaults(),
  }));
}

export function countConfiguredDefaults(day: DayScheduleConfig, groupCount: number): number {
  if (!day.deliveryEnabled || groupCount === 0) return 0;
  return Object.values(day.defaults ?? {}).filter(Boolean).length;
}

export function isDayDefaultsComplete(day: DayScheduleConfig, mealGroups: MealGroupTemplate[]): boolean {
  if (!day.deliveryEnabled) return true;
  if (!mealGroups.length) return false;
  return mealGroups.every((group) => {
    const value = day.defaults?.[group.id];
    return Boolean(value && group.allowedProductIds.includes(value));
  });
}

export function setDeliveryDayEnabled(
  option: MealOptionConfig,
  day: Weekday,
  enabled: boolean,
): MealOptionConfig {
  const weeklySchedule = option.weeklySchedule.map((d) => {
    if (d.day !== day) return d;
    if (!enabled) return { ...d, deliveryEnabled: false, defaults: emptyDefaults() };
    const defaults = { ...(d.defaults ?? {}) };
    for (const group of option.mealGroups ?? []) {
      if (!defaults[group.id] || !group.allowedProductIds.includes(defaults[group.id])) {
        defaults[group.id] = defaultForGroup(group);
      }
    }
    return { ...d, deliveryEnabled: true, defaults };
  });
  return syncDayDefaults({ ...option, weeklySchedule });
}

export function addMealGroupTemplate(option: MealOptionConfig): MealOptionConfig {
  const template = emptyMealGroupTemplate();
  const mealGroups = [...(option.mealGroups ?? []), template];
  const weeklySchedule = option.weeklySchedule.map((day) => {
    if (!day.deliveryEnabled) return day;
    return {
      ...day,
      defaults: { ...(day.defaults ?? {}), [template.id]: "" },
    };
  });
  return syncDayDefaults({ ...option, mealGroups, weeklySchedule });
}
