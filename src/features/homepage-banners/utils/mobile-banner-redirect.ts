export type MobileAppRedirectPreset =
  | "NONE"
  | "HOME"
  | "MENU"
  | "ORDERS"
  | "SUBSCRIPTIONS"
  | "CATEGORY"
  | "PRODUCT"
  | "EXTERNAL_URL";

export const MOBILE_APP_REDIRECT_OPTIONS: {
  value: MobileAppRedirectPreset;
  label: string;
  description: string;
  needsValue: boolean;
  valueLabel?: string;
  valuePlaceholder?: string;
}[] = [
  { value: "NONE", label: "None", description: "Banner is not tappable", needsValue: false },
  { value: "HOME", label: "Home", description: "Open the app home screen", needsValue: false },
  { value: "MENU", label: "Menu", description: "Open the full menu page", needsValue: false },
  { value: "ORDERS", label: "Orders", description: "Open the orders tab", needsValue: false },
  {
    value: "SUBSCRIPTIONS",
    label: "Subscriptions",
    description: "Open subscription catalog or a specific plan",
    needsValue: true,
    valueLabel: "Plan ID (optional)",
    valuePlaceholder: "Leave empty for subscription catalog",
  },
  {
    value: "CATEGORY",
    label: "Category",
    description: "Open menu filtered to a category",
    needsValue: true,
    valueLabel: "Category ID / slug",
    valuePlaceholder: "e.g. curries",
  },
  {
    value: "PRODUCT",
    label: "Product",
    description: "Open a product detail page",
    needsValue: true,
    valueLabel: "Product ID / slug",
    valuePlaceholder: "Food item ID",
  },
  {
    value: "EXTERNAL_URL",
    label: "External URL",
    description: "Open a link in the browser",
    needsValue: true,
    valueLabel: "URL",
    valuePlaceholder: "https://example.com",
  },
];

export function presetToApiRedirect(
  preset: MobileAppRedirectPreset,
  redirectValue?: string,
): { redirectType: "NONE" | "CATEGORY" | "PRODUCT" | "SUBSCRIPTION" | "EXTERNAL_URL"; redirectValue?: string } {
  const value = redirectValue?.trim();

  switch (preset) {
    case "HOME":
      return { redirectType: "EXTERNAL_URL", redirectValue: "app:/home" };
    case "MENU":
      return { redirectType: "CATEGORY", redirectValue: "menu" };
    case "ORDERS":
      return { redirectType: "EXTERNAL_URL", redirectValue: "app:/orders" };
    case "SUBSCRIPTIONS":
      return { redirectType: "SUBSCRIPTION", redirectValue: value || undefined };
    case "CATEGORY":
      return { redirectType: "CATEGORY", redirectValue: value };
    case "PRODUCT":
      return { redirectType: "PRODUCT", redirectValue: value };
    case "EXTERNAL_URL":
      return { redirectType: "EXTERNAL_URL", redirectValue: value };
    default:
      return { redirectType: "NONE" };
  }
}

export function apiToPreset(
  redirectType?: string,
  redirectValue?: string | null,
): { preset: MobileAppRedirectPreset; redirectValue: string } {
  const type = (redirectType ?? "NONE").toUpperCase();
  const value = redirectValue ?? "";

  if (type === "EXTERNAL_URL" && value === "app:/home") {
    return { preset: "HOME", redirectValue: "" };
  }
  if (type === "EXTERNAL_URL" && value === "app:/orders") {
    return { preset: "ORDERS", redirectValue: "" };
  }
  if (type === "CATEGORY" && value === "menu") {
    return { preset: "MENU", redirectValue: "" };
  }
  if (type === "SUBSCRIPTION") {
    return { preset: "SUBSCRIPTIONS", redirectValue: value };
  }
  if (type === "CATEGORY") {
    return { preset: "CATEGORY", redirectValue: value };
  }
  if (type === "PRODUCT") {
    return { preset: "PRODUCT", redirectValue: value };
  }
  if (type === "EXTERNAL_URL") {
    return { preset: "EXTERNAL_URL", redirectValue: value };
  }
  return { preset: "NONE", redirectValue: "" };
}

export function formatRedirectLabel(redirectType?: string, redirectValue?: string | null): string {
  const { preset, redirectValue: value } = apiToPreset(redirectType, redirectValue);
  const option = MOBILE_APP_REDIRECT_OPTIONS.find((item) => item.value === preset);
  if (!option) return "None";
  if (!value) return option.label;
  return `${option.label}: ${value}`;
}
