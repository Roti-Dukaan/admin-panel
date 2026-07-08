"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Calendar,
  Info,
  Clock,
  Users,
  Truck,
  Globe,
} from "lucide-react";
import {
  DeliverySlotConfig,
  MealType,
  DayOfWeek,
  SpecialDate,
  SpecialDateType,
  ALL_DAYS,
  ALL_MEAL_TYPES,
  MEAL_TYPE_CONFIG,
  SPECIAL_DATE_TYPE_CONFIG,
} from "@/features/delivery-slots/types/delivery-slot";
import { useDeliverySlotStore } from "@/features/delivery-slots/hooks/useDeliverySlots";

const EMPTY_SLOT: DeliverySlotConfig = {
  id: "",
  name: "",
  displayName: "",
  description: "",
  mealType: "lunch",
  displayOrder: 0,
  status: "draft",
  startTime: "12:00",
  endTime: "14:00",
  cutoffTime: "11:00",
  estimatedDeliveryMinutes: 60,
  preparationBufferMinutes: 45,
  maxOrders: 50,
  maxSubscriptionDeliveries: 30,
  maxOneTimeOrders: 20,
  maxMeals: 100,
  kitchenCapacityWarningPercent: 80,
  supportedPincodes: ["500089"],
  deliveryFee: 0,
  minimumOrderValue: 99,
  allowCod: true,
  allowOnlinePayments: true,
  activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  dayPreset: "weekdays",
  specialDates: [],
  currentBookings: 0,
  todayBookings: 0,
  createdAt: 0,
  updatedAt: 0,
};

type Tab = "general" | "time" | "capacity" | "delivery" | "schedule" | "special" | "preview";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "general", label: "General", icon: Info },
  { key: "time", label: "Time Config", icon: Clock },
  { key: "capacity", label: "Capacity", icon: Users },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "special", label: "Special Dates", icon: Globe },
  { key: "preview", label: "Preview", icon: Globe },
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

export function SlotDrawer() {
  const drawerOpen = useDeliverySlotStore((s) => s.drawerOpen);
  const drawerMode = useDeliverySlotStore((s) => s.drawerMode);
  const selectedSlot = useDeliverySlotStore((s) => s.selectedSlot);
  const closeDrawer = useDeliverySlotStore((s) => s.closeDrawer);
  const addSlot = useDeliverySlotStore((s) => s.addSlot);
  const updateSlot = useDeliverySlotStore((s) => s.updateSlot);

  const isViewOnly = drawerMode === "view";
  const base = selectedSlot || EMPTY_SLOT;

  const [local, setLocal] = useState<DeliverySlotConfig>(base);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [newPincode, setNewPincode] = useState("");
  const [newDateType, setNewDateType] = useState<SpecialDateType>("holiday");
  const [newDateValue, setNewDateValue] = useState("");
  const [newDateLabel, setNewDateLabel] = useState("");

  useEffect(() => {
    if (drawerOpen) {
      setLocal(selectedSlot ? { ...selectedSlot } : { ...EMPTY_SLOT });
      setActiveTab("general");
    }
  }, [drawerOpen, selectedSlot]);

  const update = (data: Partial<DeliverySlotConfig>) => setLocal((p) => ({ ...p, ...data }));

  const handleSave = () => {
    if (drawerMode === "create") {
      addSlot(local);
    } else if (drawerMode === "edit" && selectedSlot) {
      updateSlot(selectedSlot.id, local);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    if (isViewOnly) return;
    const days = local.activeDays.includes(day)
      ? local.activeDays.filter((d) => d !== day)
      : [...local.activeDays, day];
    update({ activeDays: days, dayPreset: "custom" });
  };

  const applyDayPreset = (preset: "everyday" | "weekdays" | "weekends") => {
    if (isViewOnly) return;
    const dayMap = {
      everyday: ALL_DAYS as DayOfWeek[],
      weekdays: ["monday", "tuesday", "wednesday", "thursday", "friday"] as DayOfWeek[],
      weekends: ["saturday", "sunday"] as DayOfWeek[],
    };
    update({ activeDays: dayMap[preset], dayPreset: preset });
  };

  const addPincode = () => {
    if (!newPincode.trim() || local.supportedPincodes.includes(newPincode.trim())) return;
    update({ supportedPincodes: [...local.supportedPincodes, newPincode.trim()] });
    setNewPincode("");
  };

  const removePincode = (p: string) => update({ supportedPincodes: local.supportedPincodes.filter((x) => x !== p) });

  const addSpecialDate = () => {
    if (!newDateValue || !newDateLabel.trim()) return;
    const d: SpecialDate = { id: `sd-${Date.now()}`, date: newDateValue, type: newDateType, label: newDateLabel.trim(), slotsAffected: [local.id] };
    update({ specialDates: [...local.specialDates, d] });
    setNewDateValue("");
    setNewDateLabel("");
  };

  const removeSpecialDate = (id: string) => update({ specialDates: local.specialDates.filter((d) => d.id !== id) });

  const currentTabIndex = TABS.findIndex((t) => t.key === activeTab);
  const goToNext = () => { if (currentTabIndex < TABS.length - 1) setActiveTab(TABS[currentTabIndex + 1].key); };
  const goToPrev = () => { if (currentTabIndex > 0) setActiveTab(TABS[currentTabIndex - 1].key); };

  if (!drawerOpen) return null;

  const inputCls = "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all";
  const labelCls = "block text-sm font-semibold text-gray-900 mb-2";

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeDrawer} />
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative ml-auto flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={closeDrawer} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><ArrowLeft className="h-5 w-5" /></button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {drawerMode === "create" ? "Create Delivery Slot" : drawerMode === "edit" ? `Edit: ${base.displayName}` : `View: ${base.displayName}`}
                </h2>
                <p className="text-xs text-gray-500">{isViewOnly ? "View-only mode" : "Configure delivery slot details"}</p>
              </div>
            </div>
            {!isViewOnly && (
              <div className="flex items-center gap-2">
                <button onClick={closeDrawer} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors">
                  <Save className="h-4 w-4" /> {drawerMode === "create" ? "Create Slot" : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1">
            <div className="w-52 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50/30">
              <nav className="p-3 space-y-0.5">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  return (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${active ? "bg-orange-50 text-orange-600 shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-orange-500" : "text-gray-400"}`} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl p-8">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

                  {/* GENERAL TAB */}
                  {activeTab === "general" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">General Information</h3>
                      <div><label className={labelCls}>Slot Name</label><input className={inputCls} value={local.name} onChange={(e) => update({ name: e.target.value })} disabled={isViewOnly} placeholder="e.g., lunch" /></div>
                      <div><label className={labelCls}>Display Name</label><input className={inputCls} value={local.displayName} onChange={(e) => update({ displayName: e.target.value })} disabled={isViewOnly} placeholder="e.g., Lunch Delivery" /></div>
                      <div><label className={labelCls}>Description</label><textarea className={`${inputCls} h-auto py-3 resize-none`} rows={3} value={local.description} onChange={(e) => update({ description: e.target.value })} disabled={isViewOnly} placeholder="Describe this delivery slot..." /></div>
                      <div>
                        <label className={labelCls}>Meal Type</label>
                        <div className="grid grid-cols-4 gap-2">
                          {ALL_MEAL_TYPES.map((mt) => {
                            const cfg = MEAL_TYPE_CONFIG[mt];
                            const active = local.mealType === mt;
                            return (
                              <button key={mt} onClick={() => !isViewOnly && update({ mealType: mt })} disabled={isViewOnly} className={`rounded-xl border-2 p-3 text-center transition-all ${active ? `border-current ${cfg.bgColor} ${cfg.color}` : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"} ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                <span className="text-xl">{cfg.emoji}</span>
                                <p className="mt-1 text-xs font-semibold">{cfg.label}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div><label className={labelCls}>Display Order</label><input type="number" className={inputCls} value={local.displayOrder} onChange={(e) => update({ displayOrder: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={0} /></div>
                      <div>
                        <label className={labelCls}>Status</label>
                        <div className="flex gap-2">
                          {(["draft", "active", "disabled"] as const).map((s) => (
                            <button key={s} onClick={() => !isViewOnly && update({ status: s })} disabled={isViewOnly} className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold capitalize transition-all ${local.status === s ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"} ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TIME TAB */}
                  {activeTab === "time" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Time Configuration</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Start Time</label><input type="time" className={inputCls} value={local.startTime} onChange={(e) => update({ startTime: e.target.value })} disabled={isViewOnly} /></div>
                        <div><label className={labelCls}>End Time</label><input type="time" className={inputCls} value={local.endTime} onChange={(e) => update({ endTime: e.target.value })} disabled={isViewOnly} /></div>
                      </div>
                      <div><label className={labelCls}>Order Cut-off Time</label><input type="time" className={inputCls} value={local.cutoffTime} onChange={(e) => update({ cutoffTime: e.target.value })} disabled={isViewOnly} /><p className="mt-1 text-xs text-gray-400">Orders placed after this time will be moved to the next available slot</p></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Est. Delivery Duration (min)</label><input type="number" className={inputCls} value={local.estimatedDeliveryMinutes} onChange={(e) => update({ estimatedDeliveryMinutes: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={15} step={15} /></div>
                        <div><label className={labelCls}>Prep Buffer (min)</label><input type="number" className={inputCls} value={local.preparationBufferMinutes} onChange={(e) => update({ preparationBufferMinutes: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={0} step={5} /></div>
                      </div>
                    </div>
                  )}

                  {/* CAPACITY TAB */}
                  {activeTab === "capacity" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Capacity Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Maximum Orders</label><input type="number" className={inputCls} value={local.maxOrders} onChange={(e) => update({ maxOrders: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={1} /></div>
                        <div><label className={labelCls}>Maximum Meals</label><input type="number" className={inputCls} value={local.maxMeals} onChange={(e) => update({ maxMeals: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={1} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Subscription Deliveries</label><input type="number" className={inputCls} value={local.maxSubscriptionDeliveries} onChange={(e) => update({ maxSubscriptionDeliveries: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={0} /></div>
                        <div><label className={labelCls}>One-Time Orders</label><input type="number" className={inputCls} value={local.maxOneTimeOrders} onChange={(e) => update({ maxOneTimeOrders: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={0} /></div>
                      </div>
                      <div><label className={labelCls}>Kitchen Capacity Warning %</label><input type="number" className={inputCls} value={local.kitchenCapacityWarningPercent} onChange={(e) => update({ kitchenCapacityWarningPercent: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={50} max={100} /><p className="mt-1 text-xs text-gray-400">Show warning when capacity reaches this percentage</p></div>
                      {/* Live Capacity Card */}
                      <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Current Capacity</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div><p className="text-2xl font-bold text-gray-900">{local.maxOrders}</p><p className="text-xs text-gray-500">Max Orders</p></div>
                          <div><p className="text-2xl font-bold text-orange-600">{local.currentBookings}</p><p className="text-xs text-gray-500">Booked</p></div>
                          <div><p className="text-2xl font-bold text-emerald-600">{Math.max(0, local.maxOrders - local.currentBookings)}</p><p className="text-xs text-gray-500">Remaining</p></div>
                        </div>
                        <div className="mt-4">
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${local.maxOrders > 0 ? Math.min(100, (local.currentBookings / local.maxOrders) * 100) : 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DELIVERY TAB */}
                  {activeTab === "delivery" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Delivery Settings</h3>
                      <div>
                        <label className={labelCls}>Supported Pincodes</label>
                        {!isViewOnly && (
                          <div className="flex gap-2 mb-3">
                            <input className={`${inputCls} !h-10`} value={newPincode} onChange={(e) => setNewPincode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPincode()} placeholder="Enter pincode..." maxLength={6} />
                            <button onClick={addPincode} disabled={!newPincode.trim()} className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"><Plus className="h-3.5 w-3.5" /> Add</button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {local.supportedPincodes.map((p) => (
                            <span key={p} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                              {p}
                              {!isViewOnly && <button onClick={() => removePincode(p)} className="rounded-full p-0.5 hover:bg-gray-200 transition-colors"><X className="h-3 w-3" /></button>}
                            </span>
                          ))}
                          {local.supportedPincodes.length === 0 && <p className="text-sm text-gray-400">No pincodes added</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Delivery Fee (₹)</label><input type="number" className={inputCls} value={local.deliveryFee} onChange={(e) => update({ deliveryFee: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={0} /></div>
                        <div><label className={labelCls}>Minimum Order Value (₹)</label><input type="number" className={inputCls} value={local.minimumOrderValue} onChange={(e) => update({ minimumOrderValue: parseInt(e.target.value) || 0 })} disabled={isViewOnly} min={0} /></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                          <div><p className="text-sm font-semibold text-gray-900">Allow COD</p><p className="text-xs text-gray-500">Cash on Delivery for this slot</p></div>
                          <button onClick={() => !isViewOnly && update({ allowCod: !local.allowCod })} disabled={isViewOnly} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${local.allowCod ? "bg-orange-500" : "bg-gray-300"} ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${local.allowCod ? "translate-x-6" : "translate-x-1"}`} /></button>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                          <div><p className="text-sm font-semibold text-gray-900">Allow Online Payments</p><p className="text-xs text-gray-500">UPI, cards, wallets</p></div>
                          <button onClick={() => !isViewOnly && update({ allowOnlinePayments: !local.allowOnlinePayments })} disabled={isViewOnly} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${local.allowOnlinePayments ? "bg-orange-500" : "bg-gray-300"} ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${local.allowOnlinePayments ? "translate-x-6" : "translate-x-1"}`} /></button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCHEDULE TAB */}
                  {activeTab === "schedule" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Recurring Schedule</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {(["everyday", "weekdays", "weekends"] as const).map((p) => (
                          <button key={p} onClick={() => applyDayPreset(p)} disabled={isViewOnly} className={`rounded-xl border-2 p-3 text-center text-sm font-semibold capitalize transition-all ${local.dayPreset === p ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"} ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className={labelCls}>Active Days</label>
                        <div className="flex gap-2">
                          {ALL_DAYS.map((day) => {
                            const active = local.activeDays.includes(day);
                            return (
                              <button key={day} onClick={() => toggleDay(day)} disabled={isViewOnly} className={`h-12 flex-1 rounded-xl text-sm font-semibold transition-all ${active ? "bg-orange-500 text-white shadow-sm" : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300"} ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                {DAY_LABELS[day]}
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-gray-400">{local.activeDays.length} day(s) active</p>
                      </div>
                    </div>
                  )}

                  {/* SPECIAL DATES TAB */}
                  {activeTab === "special" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Special Dates</h3>
                      {!isViewOnly && (
                        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
                          <div className="grid grid-cols-3 gap-3">
                            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Date</label><input type="date" className={`${inputCls} !h-10`} value={newDateValue} onChange={(e) => setNewDateValue(e.target.value)} /></div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">Type</label>
                              <select className={`${inputCls} !h-10`} value={newDateType} onChange={(e) => setNewDateType(e.target.value as SpecialDateType)}>
                                {Object.entries(SPECIAL_DATE_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                            </div>
                            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Label</label><input className={`${inputCls} !h-10`} value={newDateLabel} onChange={(e) => setNewDateLabel(e.target.value)} placeholder="e.g., Republic Day" /></div>
                          </div>
                          <button onClick={addSpecialDate} disabled={!newDateValue || !newDateLabel.trim()} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"><Plus className="h-4 w-4" /> Add Date</button>
                        </div>
                      )}
                      {local.specialDates.length > 0 ? (
                        <div className="space-y-2">
                          {local.specialDates.map((sd) => {
                            const cfg = SPECIAL_DATE_TYPE_CONFIG[sd.type];
                            return (
                              <div key={sd.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>{cfg.label}</span>
                                  <span className="text-sm font-medium text-gray-900">{sd.label}</span>
                                  <span className="text-xs text-gray-400">{sd.date}</span>
                                </div>
                                {!isViewOnly && <button onClick={() => removeSpecialDate(sd.id)} className="rounded-lg p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center"><p className="text-sm text-gray-400">No special dates configured</p></div>
                      )}
                    </div>
                  )}

                  {/* PREVIEW TAB */}
                  {activeTab === "preview" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Website Preview</h3>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Choose Delivery Time</p>
                        <div className="space-y-3">
                          {local.status === "active" && (
                            <div className="rounded-xl border-2 border-orange-500 bg-orange-50 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-orange-500 bg-orange-500"><span className="h-2 w-2 rounded-full bg-white" /></div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{MEAL_TYPE_CONFIG[local.mealType].emoji} {local.displayName}</p>
                                  <p className="text-xs text-gray-500">{formatTime(local.startTime)} – {formatTime(local.endTime)}</p>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-emerald-600">{Math.max(0, local.maxOrders - local.currentBookings)} Slots Available</span>
                            </div>
                          )}
                          <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-3">
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">🌙 Dinner</p>
                                <p className="text-xs text-gray-500">7:00 PM – 9:00 PM</p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-400">12 Slots Available</span>
                          </div>
                        </div>
                      </div>
                      {/* Booking Summary Cards */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Booking Summary</p>
                        <div className="grid grid-cols-2 gap-3">
                          {ALL_MEAL_TYPES.map((mt) => {
                            const cfg = MEAL_TYPE_CONFIG[mt];
                            const isActive = local.mealType === mt;
                            const cap = isActive ? local.maxOrders : Math.floor(Math.random() * 40 + 20);
                            const booked = isActive ? local.currentBookings : Math.floor(cap * Math.random() * 0.7);
                            const remaining = cap - booked;
                            const pct = cap > 0 ? Math.round((booked / cap) * 100) : 0;
                            const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
                            return (
                              <div key={mt} className={`rounded-xl border p-4 ${isActive ? "border-orange-300 bg-orange-50/50" : "border-gray-200 bg-white"}`}>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-lg">{cfg.emoji}</span>
                                  <span className="text-sm font-semibold text-gray-900">{cfg.label}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                                  <div><p className="font-bold text-gray-900">{cap}</p><p className="text-gray-400">Capacity</p></div>
                                  <div><p className="font-bold text-orange-600">{booked}</p><p className="text-gray-400">Booked</p></div>
                                  <div><p className="font-bold text-emerald-600">{remaining}</p><p className="text-gray-400">Remaining</p></div>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-100"><div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} /></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3">
            <button onClick={goToPrev} disabled={currentTabIndex === 0} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ArrowLeft className="h-4 w-4" /> Previous</button>
            <span className="text-xs font-medium text-gray-400">{currentTabIndex + 1} of {TABS.length}</span>
            {currentTabIndex < TABS.length - 1 ? (
              <button onClick={goToNext} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">Next →</button>
            ) : <div className="w-[120px]" />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}
