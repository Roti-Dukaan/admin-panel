export type DurationUnit = "DAYS" | "WEEKS" | "MONTHS";
export type PublishStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
export type SelectionRule = "CHOOSE_ONE" | "CHOOSE_MULTIPLE" | "FIXED";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type CutoffType = "PREVIOUS_DAY" | "SAME_DAY" | "HOURS_BEFORE";
export type SkipBehaviour = "EXTEND_SUBSCRIPTION" | "CONSUME_SUBSCRIPTION_DAY";
export type EarliestStart = "NEXT_DAY" | "TODAY" | "CUSTOM_DAYS";

export const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export const SELECTION_RULE_OPTIONS: { value: SelectionRule; label: string }[] = [
  { value: "CHOOSE_ONE", label: "Choose One" },
  { value: "CHOOSE_MULTIPLE", label: "Choose Multiple" },
  { value: "FIXED", label: "Fixed (no choice)" },
];

export interface MealGroupTemplate {
  id: string;
  groupName: string;
  selectionRule: SelectionRule;
  allowedProductIds: string[];
  quantity: number;
}

/** Expanded group stored on each delivery day in API / legacy configs. */
export interface MealGroupConfig extends MealGroupTemplate {
  defaultProductId: string;
}

export interface DayScheduleConfig {
  day: Weekday;
  deliveryEnabled: boolean;
  /** Per-day default product for each universal meal group (groupId -> foodItemId). */
  defaults: Record<string, string>;
  /** Expanded groups — populated when loading legacy plans or saving to API. */
  mealGroups?: MealGroupConfig[];
}

export interface MealOptionConfig {
  id: string;
  name: string;
  price: number;
  allowedSchedulingSlotIds: string[];
  /** Universal meal groups shared across all delivery days. */
  mealGroups: MealGroupTemplate[];
  weeklySchedule: DayScheduleConfig[];
}

export interface MealCustomizationRules {
  allowed: boolean;
  modificationCutoffTime: string;
  cutoffType: CutoffType;
  cutoffHours: number;
}

export interface SkipRules {
  allowed: boolean;
  maximumSkips: number;
  skipCutoffHours: number;
  behaviour: SkipBehaviour;
}

export interface PauseRules {
  allowed: boolean;
  minimumPauseDays: number;
  maximumPauseDays: number;
  maximumPauses: number;
}

export interface SubscriptionStartRules {
  customerSelectsStartDate: boolean;
  earliestStart: EarliestStart;
  earliestStartDays: number;
  bookingCutoffTime: string;
}

export interface PlanRulesConfig {
  mealCustomization: MealCustomizationRules;
  skip: SkipRules;
  pause: PauseRules;
  subscriptionStart: SubscriptionStartRules;
}

export interface PlanBuilderConfig {
  mealOptions: MealOptionConfig[];
  rules: PlanRulesConfig;
}

export interface PlanBuilderForm {
  planName: string;
  description: string;
  planImageUrl: string;
  durationValue: number;
  durationUnit: DurationUnit;
  status: PublishStatus;
  config: PlanBuilderConfig;
}

export interface PlanBuilderPayload {
  name: string;
  description?: string;
  planImageUrl?: string;
  durationValue: number;
  durationUnit: DurationUnit;
  publishStatus?: PublishStatus;
  planBuilderConfig: PlanBuilderConfig;
  publish?: boolean;
}

export function createId(): string {
  return crypto.randomUUID();
}

export function emptyMealGroupTemplate(): MealGroupTemplate {
  return {
    id: createId(),
    groupName: "",
    selectionRule: "CHOOSE_ONE",
    allowedProductIds: [],
    quantity: 1,
  };
}

/** @deprecated use emptyMealGroupTemplate */
export function emptyMealGroup(): MealGroupConfig {
  return { ...emptyMealGroupTemplate(), defaultProductId: "" };
}

export function emptyWeeklySchedule(): DayScheduleConfig[] {
  return WEEKDAYS.map(({ key }) => ({
    day: key,
    deliveryEnabled: key !== "sun",
    defaults: {},
  }));
}

export function emptyMealOption(): MealOptionConfig {
  return {
    id: createId(),
    name: "",
    price: 0,
    allowedSchedulingSlotIds: [],
    mealGroups: [],
    weeklySchedule: emptyWeeklySchedule(),
  };
}

export function defaultPlanRules(): PlanRulesConfig {
  return {
    mealCustomization: {
      allowed: true,
      modificationCutoffTime: "22:00",
      cutoffType: "PREVIOUS_DAY",
      cutoffHours: 24,
    },
    skip: {
      allowed: true,
      maximumSkips: 2,
      skipCutoffHours: 12,
      behaviour: "EXTEND_SUBSCRIPTION",
    },
    pause: {
      allowed: false,
      minimumPauseDays: 3,
      maximumPauseDays: 14,
      maximumPauses: 2,
    },
    subscriptionStart: {
      customerSelectsStartDate: true,
      earliestStart: "NEXT_DAY",
      earliestStartDays: 1,
      bookingCutoffTime: "20:00",
    },
  };
}

export function emptyPlanBuilderForm(): PlanBuilderForm {
  return {
    planName: "",
    description: "",
    planImageUrl: "",
    durationValue: 30,
    durationUnit: "DAYS",
    status: "DRAFT",
    config: {
      mealOptions: [],
      rules: defaultPlanRules(),
    },
  };
}
