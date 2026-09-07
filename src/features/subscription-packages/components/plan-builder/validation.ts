import type { PlanBuilderForm } from "../../types/plan-builder";

export type ValidationErrors = Record<string, string>;

export function validateForPublish(form: PlanBuilderForm): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!form.planName.trim()) {
    errors.planName = "Plan name is required";
  }
  if (!form.durationValue || form.durationValue < 1) {
    errors.durationValue = "Duration is required";
  }
  if (!form.config.mealOptions.length) {
    errors.mealOptions = "Add at least one meal option";
  }

  form.config.mealOptions.forEach((option, idx) => {
    const prefix = `mealOption.${idx}`;
    if (!option.name.trim()) {
      errors[`${prefix}.name`] = "Meal option name is required";
    }
    if (option.price == null || Number(option.price) < 0) {
      errors[`${prefix}.price`] = "Price is required";
    }
    if (!option.allowedSchedulingSlotIds.length) {
      errors[`${prefix}.slots`] = "Select at least one scheduling slot";
    }
    if (!option.allowedProductIds.length) {
      errors[`${prefix}.products`] = "Select at least one allowed product";
    }

    option.weeklySchedule.forEach((day) => {
      if (!day.deliveryEnabled) return;
      const dayKey = `${prefix}.${day.day}`;
      if (!day.mealGroups.length) {
        errors[dayKey] = `Configure meal for ${day.day}`;
        return;
      }
      day.mealGroups.forEach((group, gIdx) => {
        const gKey = `${dayKey}.group.${gIdx}`;
        if (!group.groupName.trim()) {
          errors[`${gKey}.name`] = "Group name is required";
        }
        if (!group.defaultProductId) {
          errors[`${gKey}.default`] = "Default product is required";
        } else if (!option.allowedProductIds.includes(group.defaultProductId)) {
          errors[`${gKey}.default`] = "Default must be in allowed products";
        }
        if (!group.quantity || group.quantity < 1) {
          errors[`${gKey}.quantity`] = "Quantity must be at least 1";
        }
      });
    });
  });

  return errors;
}
