"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Save,
  ArrowLeft,
  Info,
  IndianRupee,
  UtensilsCrossed,
  Calendar,
  ListChecks,
  Sparkles,
  Shield,
  Truck,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SubscriptionPlan, PlanTab, PLAN_TABS } from "@/features/subscription-plans/types/subscription-plan";
import { useSubscriptionPlanStore } from "@/features/subscription-plans/hooks/useSubscriptionPlans";
import { GeneralTab } from "./GeneralTab";
import { PricingTab } from "./PricingTab";
import { MealsTab } from "./MealsTab";
import { DeliveryScheduleTab } from "./DeliveryScheduleTab";
import { MenuTab } from "./MenuTab";
import { BenefitsTab } from "./BenefitsTab";
import { RulesTab } from "./RulesTab";
import { DeliveryRulesTab } from "./DeliveryRulesTab";
import { WebsitePreviewTab } from "./WebsitePreviewTab";
import { SeoTab } from "./SeoTab";

const TAB_ICONS: Record<string, React.ElementType> = {
  Info,
  IndianRupee,
  UtensilsCrossed,
  Calendar,
  ListChecks,
  Sparkles,
  Shield,
  Truck,
  Eye,
  Search,
};

const EMPTY_PLAN: SubscriptionPlan = {
  id: "",
  name: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  planBadge: "",
  displayOrder: 0,
  status: "draft",
  isFeatured: false,
  pricing: {
    weeklyPrice: 0,
    monthlyPrice: 0,
    quarterlyPrice: 0,
    yearlyPrice: 0,
    offerPrice: 0,
    gstPercent: 5,
    deliveryCharges: 0,
    freeDelivery: false,
    strikePrice: 0,
    currency: "INR",
  },
  meals: {
    mealsAvailable: ["lunch"],
    dailyMealCount: 1,
    rotisPerMeal: 2,
    curriesIncluded: 1,
    extraCurryAllowed: false,
    extraRotiAllowed: false,
    maxRotisPerDay: 4,
  },
  delivery: {
    deliveryDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    dayPreset: "weekdays",
    deliverySlots: ["lunch"],
  },
  menu: {
    rotis: [],
    vegCurries: [],
    nonVeg: [],
    combos: [],
    maxRotis: 2,
    maxCurries: 1,
    dailyQuantityLimit: 1,
  },
  benefits: [],
  rules: {
    pauseAllowed: true,
    maxPauseDays: 7,
    pauseNoticeDays: 1,
    skipMealsAllowed: true,
    maxSkips: 3,
    carryForward: false,
    cancellationNoticeDays: 2,
    minSubscriptionDays: 7,
    renewalType: "automatic",
  },
  deliveryRules: {
    supportedPincodes: [],
    maxDeliveriesPerSlot: 50,
    kitchenCapacity: 100,
    blackoutDates: [],
    holidayRules: "",
    deliveryChargeOverrides: "",
    minOrderDays: 7,
  },
  seo: {
    planUrl: "",
    metaTitle: "",
    metaDescription: "",
    ogImageUrl: "",
  },
  subscribers: 0,
  createdAt: 0,
  updatedAt: 0,
};

export function PlanEditor() {
  const editorOpen = useSubscriptionPlanStore((s) => s.editorOpen);
  const editorMode = useSubscriptionPlanStore((s) => s.editorMode);
  const selectedPlan = useSubscriptionPlanStore((s) => s.selectedPlan);
  const activeTab = useSubscriptionPlanStore((s) => s.activeTab);
  const closeEditor = useSubscriptionPlanStore((s) => s.closeEditor);
  const setActiveTab = useSubscriptionPlanStore((s) => s.setActiveTab);
  const addPlan = useSubscriptionPlanStore((s) => s.addPlan);
  const updatePlan = useSubscriptionPlanStore((s) => s.updatePlan);

  const isViewOnly = editorMode === "view";
  const basePlan = selectedPlan || EMPTY_PLAN;

  const [localPlan, setLocalPlan] = useState<SubscriptionPlan>(basePlan);

  useEffect(() => {
    if (editorOpen) {
      setLocalPlan(selectedPlan ? { ...selectedPlan } : { ...EMPTY_PLAN });
    }
  }, [editorOpen, selectedPlan]);

  const handleUpdate = (data: Partial<SubscriptionPlan>) => {
    setLocalPlan((prev) => ({ ...prev, ...data }));
  };

  const handlePricingUpdate = (data: Record<string, number | string | boolean>) => {
    setLocalPlan((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, ...data },
    }));
  };

  const handleMealsUpdate = (data: Record<string, unknown>) => {
    setLocalPlan((prev) => ({
      ...prev,
      meals: { ...prev.meals, ...data },
    }));
  };

  const handleDeliveryUpdate = (data: Record<string, unknown>) => {
    setLocalPlan((prev) => ({
      ...prev,
      delivery: { ...prev.delivery, ...data },
    }));
  };

  const handleMenuUpdate = (data: Record<string, unknown>) => {
    setLocalPlan((prev) => ({
      ...prev,
      menu: { ...prev.menu, ...data },
    }));
  };

  const handleBenefitsUpdate = (benefits: SubscriptionPlan["benefits"]) => {
    setLocalPlan((prev) => ({ ...prev, benefits }));
  };

  const handleRulesUpdate = (data: Record<string, unknown>) => {
    setLocalPlan((prev) => ({
      ...prev,
      rules: { ...prev.rules, ...data },
    }));
  };

  const handleDeliveryRulesUpdate = (data: Record<string, unknown>) => {
    setLocalPlan((prev) => ({
      ...prev,
      deliveryRules: { ...prev.deliveryRules, ...data },
    }));
  };

  const handleSeoUpdate = (data: Record<string, string>) => {
    setLocalPlan((prev) => ({
      ...prev,
      seo: { ...prev.seo, ...data },
    }));
  };

  const handleSave = () => {
    if (editorMode === "create") {
      addPlan(localPlan);
    } else if (editorMode === "edit" && selectedPlan) {
      updatePlan(selectedPlan.id, localPlan);
    }
  };

  const currentTabIndex = PLAN_TABS.findIndex((t) => t.key === activeTab);

  const goToNextTab = () => {
    if (currentTabIndex < PLAN_TABS.length - 1) {
      setActiveTab(PLAN_TABS[currentTabIndex + 1].key);
    }
  };

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(PLAN_TABS[currentTabIndex - 1].key);
    }
  };

  if (!editorOpen) return null;

  const editorTitle =
    editorMode === "create"
      ? "Create New Plan"
      : editorMode === "edit"
      ? `Edit: ${basePlan.name}`
      : `View: ${basePlan.name}`;

  const editorSubtitle = isViewOnly
    ? "View-only mode"
    : "Fill in the details for your subscription plan";

  const tabDescription: Record<PlanTab, string> = {
    general: "Basic information about the plan.",
    pricing: "Configure pricing tiers and delivery charges.",
    meals: "Set up meal types and roti/curry configurations.",
    delivery: "Choose delivery days and available time slots.",
    menu: "Select which menu items are included in this plan.",
    benefits: "Add and organize plan benefits for customers.",
    rules: "Configure pause, skip, cancellation and renewal rules.",
    "delivery-rules": "Set pincodes, capacity, and delivery constraints.",
    preview: "See how the plan looks on the customer website.",
    seo: "Optimize the plan page for search engines.",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={closeEditor}
        />

        {/* Editor Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative ml-auto flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={closeEditor}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editorTitle}</h2>
                <p className="text-xs text-gray-500">{editorSubtitle}</p>
              </div>
            </div>
            {!isViewOnly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={closeEditor}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {editorMode === "create" ? "Create Plan" : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1">
            {/* Tab Sidebar */}
            <div className="w-56 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50/30">
              <nav className="p-3 space-y-0.5">
                {PLAN_TABS.map((tab) => {
                  const Icon = TAB_ICONS[tab.icon];
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                        active
                          ? "bg-orange-50 text-orange-600 shadow-sm"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      {Icon && (
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active ? "text-orange-500" : "text-gray-400"
                          }`}
                        />
                      )}
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl p-8">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="mb-1 text-lg font-bold text-gray-900">
                    {PLAN_TABS.find((t) => t.key === activeTab)?.label}
                  </h3>
                  <p className="mb-6 text-sm text-gray-500">
                    {tabDescription[activeTab]}
                  </p>

                  {activeTab === "general" && (
                    <GeneralTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handleUpdate} />
                  )}
                  {activeTab === "pricing" && (
                    <PricingTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handlePricingUpdate} />
                  )}
                  {activeTab === "meals" && (
                    <MealsTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handleMealsUpdate} />
                  )}
                  {activeTab === "delivery" && (
                    <DeliveryScheduleTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handleDeliveryUpdate} />
                  )}
                  {activeTab === "menu" && (
                    <MenuTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handleMenuUpdate} />
                  )}
                  {activeTab === "benefits" && (
                    <BenefitsTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handleBenefitsUpdate} />
                  )}
                  {activeTab === "rules" && (
                    <RulesTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handleRulesUpdate} />
                  )}
                  {activeTab === "delivery-rules" && (
                    <DeliveryRulesTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handleDeliveryRulesUpdate} />
                  )}
                  {activeTab === "preview" && <WebsitePreviewTab plan={localPlan} />}
                  {activeTab === "seo" && (
                    <SeoTab plan={localPlan} isViewOnly={isViewOnly} onUpdate={handleSeoUpdate} />
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3">
            <button
              onClick={goToPrevTab}
              disabled={currentTabIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-xs font-medium text-gray-400">
              {currentTabIndex + 1} of {PLAN_TABS.length}
            </span>
            {currentTabIndex < PLAN_TABS.length - 1 ? (
              <button
                onClick={goToNextTab}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-[120px]" />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
