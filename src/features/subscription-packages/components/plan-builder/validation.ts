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
      if (!group.quantity || group.quantity < 1) {
        errors[`${gKey}.quantity`] = "Quantity must be at least 1";
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
