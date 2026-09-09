import type { PlanBuilderForm } from "../../types/plan-builder";
import { getDefaultDurationOption } from "../../types/plan-builder";
import { isDayDefaultsComplete } from "../../utils/plan-builder-schedule.util";

export type ValidationErrors = Record<string, string>;

export function validateForPublish(form: PlanBuilderForm): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!form.planName.trim()) {
    errors.planName = "Plan name is required";
  }

  const durationOptions = form.config.durationOptions ?? [];
  if (!durationOptions.length) {
    errors.durationOptions = "Add at least one duration option";
  } else if (durationOptions.some((option) => !option.days || option.days < 1)) {
    errors.durationOptions = "Each duration option must have at least 1 delivery";
  } else if (new Set(durationOptions.map((option) => option.days)).size !== durationOptions.length) {
    errors.durationOptions = "Each duration option must have a unique number of deliveries";
  } else if (!getDefaultDurationOption(durationOptions)) {
    errors.durationOptions = "Select a default duration option";
  }

  if (!form.config.mealOptions.length) {
    errors.mealOptions = "Add at least one meal option";
  }

  form.config.mealOptions.forEach((option, idx) => {
    const prefix = `mealOption.${idx}`;
    if (!option.name.trim()) {
      errors[`${prefix}.name`] = "Meal option name is required";
    }
    if (option.price == null || Number(option.price) <= 0) {
      errors[`${prefix}.price`] = "Price per delivery must be greater than 0";
    }
    if (!option.allowedSchedulingSlotIds.length) {
      errors[`${prefix}.slots`] = "Select at least one scheduling slot";
    }

    if (!option.mealGroups.length) {
      errors[`${prefix}.groups.required`] = "Add at least one universal meal group";
    }

    option.mealGroups.forEach((group, gIdx) => {
      const gKey = `${prefix}.groups.${gIdx}`;
      if (!group.groupName.trim()) {
        errors[`${gKey}.name`] = "Group name is required";
      }
      if (!group.allowedProductIds.length) {
        errors[`${gKey}.products`] = "Select allowed products";
      }
      const included = group.includedQuantity ?? group.quantity ?? 1;
      const maximum = group.maximumQuantity ?? group.quantity ?? included;
      if (included < 0) {
        errors[`${gKey}.quantity`] = "Included quantity cannot be negative";
      }
      if (maximum < 1) {
        errors[`${gKey}.quantity`] = "Maximum quantity must be at least 1";
      }
      if (maximum < included) {
        errors[`${gKey}.quantity`] = "Maximum must be greater than or equal to included";
      }
      if (group.allowPaidExtras && maximum <= included) {
        errors[`${gKey}.quantity`] = "Raise max above included to allow paid extras";
      }
    });

    option.weeklySchedule.forEach((day) => {
      if (!day.deliveryEnabled) return;
      const dayKey = `${prefix}.${day.day}`;
      if (!option.mealGroups.length) {
        errors[dayKey] = `Add universal meal groups for ${day.day}`;
        return;
      }
      if (!isDayDefaultsComplete(day, option.mealGroups)) {
        errors[dayKey] = `Configure default products for ${day.day}`;
      }
      option.mealGroups.forEach((group, gIdx) => {
        const defaultId = day.defaults?.[group.id];
        const gKey = `${dayKey}.group.${gIdx}`;
        if (!defaultId) {
          errors[`${gKey}.default`] = "Default product is required";
        } else if (!group.allowedProductIds.includes(defaultId)) {
          errors[`${gKey}.default`] = "Default must be in allowed products";
        }
      });
    });
  });

  return errors;
}

const MEAL_SCHEDULE_DAY_KEY = /^mealOption\.\d+\.(mon|tue|wed|thu|fri|sat|sun)/;

export function formatValidationSummary(errors: ValidationErrors): string {
  const messages = [...new Set(Object.values(errors).filter(Boolean))];
  if (!messages.length) return "Fix validation errors before publishing";
  if (messages.length === 1) return messages[0]!;
  const preview = messages.slice(0, 3).join(" • ");
  const extra = messages.length > 3 ? ` (+${messages.length - 3} more)` : "";
  return `${messages.length} issues: ${preview}${extra}`;
}

export function getMealOptionsSectionError(errors: ValidationErrors): string | undefined {
  if (errors.mealOptions) return errors.mealOptions;
  const keys = Object.keys(errors).filter(
    (key) => key.startsWith("mealOption.") && !MEAL_SCHEDULE_DAY_KEY.test(key),
  );
  if (!keys.length) return undefined;
  return errors[keys[0]!] ?? `${keys.length} issue(s) in meal options`;
}

export function getScheduleSectionError(errors: ValidationErrors): string | undefined {
  const keys = Object.keys(errors).filter((key) => MEAL_SCHEDULE_DAY_KEY.test(key));
  if (!keys.length) return undefined;
  return errors[keys[0]!] ?? `${keys.length} schedule issue(s)`;
}

export function getExpandedSectionsForErrors(errors: ValidationErrors) {
  const keys = Object.keys(errors);
  return {
    details: keys.some((key) => key === "planName" || key === "durationOptions"),
    mealOptions: keys.some((key) => key.startsWith("mealOption.") && !MEAL_SCHEDULE_DAY_KEY.test(key)),
    schedule: keys.some((key) => MEAL_SCHEDULE_DAY_KEY.test(key)),
    rules: false,
  };
}

export function mergeExpandedSections(
  current: { details: boolean; mealOptions: boolean; schedule: boolean; rules: boolean },
  forErrors: ReturnType<typeof getExpandedSectionsForErrors>,
) {
  return {
    details: current.details || forErrors.details,
    mealOptions: current.mealOptions || forErrors.mealOptions,
    schedule: current.schedule || forErrors.schedule,
    rules: current.rules || forErrors.rules,
  };
}
