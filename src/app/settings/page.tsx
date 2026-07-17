"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Settings,
  Building2,
  Receipt,
  CreditCard,
  Truck,
  MapPin,
  Save,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  CheckCircle,
  AlertCircle,
  X,
  ToggleLeft,
  ToggleRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Activity,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { useSettingsStore } from "@/features/settings/hooks/useSettings";
import { useDeliveryProviderStore } from "@/features/delivery-providers/hooks/useDeliveryProviders";
import type { SettingsTab, PincodeData, BusinessSettingsData, TaxConfigData, PaymentConfigData, DeliveryConfigData } from "@/features/settings/types/settings";
import { PROVIDER_LABELS, STRATEGY_LABELS } from "@/features/delivery-providers/types/delivery-provider";

const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
  { key: "business", label: "Business", icon: Building2 },
  { key: "tax", label: "Tax", icon: Receipt },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "pincodes", label: "Pincodes", icon: MapPin },
  { key: "delivery-providers", label: "Delivery Providers", icon: Server },
];

export default function SettingsPage() {
  const {
    settings,
    loading,
    saving,
    activeTab,
    error,
    successMessage,
    loadSettings,
    setActiveTab,
    updateBusiness,
    updateTax,
    updatePayment,
    updateDelivery,
    addPincode,
    updatePincode,
    deletePincode,
    clearMessages,
  } = useSettingsStore();

  const {
    settings: providerSettings,
    loading: providerLoading,
    loadSettings: loadProviderSettings,
    clearMessages: clearProviderMessages,
  } = useDeliveryProviderStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (activeTab === "delivery-providers") {
      loadProviderSettings();
    }
  }, [activeTab, loadProviderSettings]);

  useEffect(() => {
    if (successMessage || error) {
      const t = setTimeout(clearMessages, 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, error, clearMessages]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your business configuration.</p>
          </div>
        </motion.div>

        {/* Toast */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <CheckCircle className="h-4 w-4" />
            {successMessage}
            <button onClick={clearMessages} className="ml-auto"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
            <button onClick={clearMessages} className="ml-auto"><X className="h-4 w-4" /></button>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm overflow-x-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-sm text-gray-500">Loading settings...</span>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "business" && <BusinessTab saving={saving} onSubmit={updateBusiness} data={settings} />}
            {activeTab === "tax" && <TaxTab saving={saving} onSubmit={updateTax} data={settings?.tax ?? null} />}
            {activeTab === "payment" && <PaymentTab saving={saving} onSubmit={updatePayment} data={settings?.payment ?? null} />}
            {activeTab === "delivery" && <DeliveryTab saving={saving} onSubmit={updateDelivery} data={settings?.delivery ?? null} />}
            {activeTab === "pincodes" && (
              <PincodesTab
                saving={saving}
                pincodes={settings?.delivery?.pincodes || []}
                onAdd={addPincode}
                onUpdate={updatePincode}
                onDelete={deletePincode}
              />
            )}
            {activeTab === "delivery-providers" && (
              <DeliveryProvidersTab />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, disabled }: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6 bg-orange-500" : "translate-x-1 bg-gray-300"}`} />
      </button>
    </label>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end pt-4">
      <button
        onClick={onClick}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

/* ─── Business Tab ─── */
function BusinessTab({ saving, onSubmit, data }: { saving: boolean; onSubmit: (d: Record<string, unknown>) => Promise<void>; data: BusinessSettingsData | null }) {
  const [form, setForm] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    website: "",
    gstin: "",
    fssaiLicense: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    orderPreparationTimeMinutes: 20,
  });

  useEffect(() => {
    if (data) {
      setForm({
        businessName: data.businessName || "",
        businessEmail: data.businessEmail || "",
        businessPhone: data.supportPhone || "",
        businessAddress: data.businessAddress || "",
        website: data.website || "",
        gstin: data.gstin || "",
        fssaiLicense: data.fssaiLicense || "",
        currency: data.currency || "INR",
        timezone: data.timezone || "Asia/Kolkata",
        orderPreparationTimeMinutes: data.orderPreparationTimeMinutes || 20,
      });
    }
  }, [data]);

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Business Information</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Business Name">
          <Input value={form.businessName} onChange={(v) => set("businessName", v)} placeholder="Roti Dukaan" />
        </Field>
        <Field label="Email">
          <Input value={form.businessEmail} onChange={(v) => set("businessEmail", v)} placeholder="info@rotidukaan.com" />
        </Field>
        <Field label="Phone">
          <Input value={form.businessPhone} onChange={(v) => set("businessPhone", v)} placeholder="9876543210" />
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={(v) => set("website", v)} placeholder="https://rotidukaan.com" />
        </Field>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Business Address</label>
        <textarea
          value={form.businessAddress}
          onChange={(e) => set("businessAddress", e.target.value)}
          placeholder="Full address for invoices (e.g. 123 Main St, Hyderabad, Telangana 500001)"
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
        />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h4 className="mb-4 text-sm font-bold text-gray-700">Tax & Compliance</h4>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="GSTIN">
            <Input value={form.gstin} onChange={(v) => set("gstin", v)} placeholder="29XXXXXXXXXXXXX" />
          </Field>
          <Field label="FSSAI License No">
            <Input value={form.fssaiLicense} onChange={(v) => set("fssaiLicense", v)} placeholder="XXXXXXXXXXXXXXXX" />
          </Field>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h4 className="mb-4 text-sm font-bold text-gray-700">Operations</h4>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Currency">
            <Input value={form.currency} onChange={(v) => set("currency", v)} />
          </Field>
          <Field label="Timezone">
            <Input value={form.timezone} onChange={(v) => set("timezone", v)} />
          </Field>
          <Field label="Prep Time (minutes)">
            <Input type="number" value={form.orderPreparationTimeMinutes} onChange={(v) => set("orderPreparationTimeMinutes", Number(v))} />
          </Field>
        </div>
      </div>

      <SaveButton saving={saving} onClick={() => onSubmit(form)} />
    </div>
  );
}

/* ─── Tax Tab ─── */
function TaxTab({ saving, onSubmit, data }: { saving: boolean; onSubmit: (d: Record<string, unknown>) => Promise<void>; data: TaxConfigData | null }) {
  const [form, setForm] = useState({
    name: "",
    gstPercentage: 0,
    sacCode: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        gstPercentage: data.gstPercentage || 0,
        sacCode: data.sacCode || "",
      });
    }
  }, [data]);

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Tax Configuration</h3>
      <p className="text-sm text-gray-500">GST is calculated on the base price of each food item.</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Tax Name">
          <Input value={form.name} onChange={(v) => set("name", v)} placeholder="GST 5%" />
        </Field>
        <Field label="GST Percentage (%)">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">%</span>
            <input
              type="number"
              value={form.gstPercentage}
              onChange={(e) => set("gstPercentage", Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-7 pr-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </Field>
        <Field label="SAC Code">
          <Input value={form.sacCode} onChange={(v) => set("sacCode", v)} placeholder="21069099" />
        </Field>
      </div>
      <SaveButton saving={saving} onClick={() => onSubmit(form)} />
    </div>
  );
}

/* ─── Payment Tab ─── */
function PaymentTab({ saving, onSubmit, data }: { saving: boolean; onSubmit: (d: Record<string, unknown>) => Promise<void>; data: PaymentConfigData | null }) {
  const [form, setForm] = useState({
    cashOnDeliveryEnabled: true,
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        cashOnDeliveryEnabled: data.cashOnDeliveryEnabled,
        razorpayEnabled: data.razorpayEnabled,
        razorpayKeyId: data.razorpayKeyId || "",
        razorpayKeySecret: "",
      });
    }
  }, [data]);

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Payment Settings</h3>
      <div className="space-y-4">
        <Toggle checked={form.cashOnDeliveryEnabled} onChange={(v) => set("cashOnDeliveryEnabled", v)} label="Cash on Delivery (COD)" />
        <Toggle checked={form.razorpayEnabled} onChange={(v) => set("razorpayEnabled", v)} label="Razorpay Online Payments" />
      </div>
      {form.razorpayEnabled && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2">
          <Field label="Razorpay Key ID">
            <Input value={form.razorpayKeyId} onChange={(v) => set("razorpayKeyId", v)} placeholder="rzp_test_..." />
          </Field>
          <Field label="Razorpay Key Secret">
            <Input type="password" value={form.razorpayKeySecret} onChange={(v) => set("razorpayKeySecret", v)} placeholder="Enter secret key" />
          </Field>
        </div>
      )}
      <SaveButton saving={saving} onClick={() => onSubmit(form)} />
    </div>
  );
}

/* ─── Delivery Tab ─── */
function DeliveryTab({ saving, onSubmit, data }: { saving: boolean; onSubmit: (d: Record<string, unknown>) => Promise<void>; data: DeliveryConfigData | null }) {
  const [form, setForm] = useState({
    defaultDeliveryCharge: 0,
    freeDeliveryAbove: 0,
    minimumOrderAmount: 0,
    maximumOrderAmount: 10000,
    allowScheduledDelivery: false,
  });

  useEffect(() => {
    if (data) {
      setForm({
        defaultDeliveryCharge: data.defaultDeliveryCharge || 0,
        freeDeliveryAbove: data.freeDeliveryAbove || 0,
        minimumOrderAmount: data.minimumOrderAmount || 0,
        maximumOrderAmount: data.maximumOrderAmount || 10000,
        allowScheduledDelivery: data.allowScheduledDelivery,
      });
    }
  }, [data]);

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Delivery Settings</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Default Delivery Charge (₹)">
          <Input type="number" value={form.defaultDeliveryCharge} onChange={(v) => set("defaultDeliveryCharge", Number(v))} />
        </Field>
        <Field label="Free Delivery Above (₹)">
          <Input type="number" value={form.freeDeliveryAbove} onChange={(v) => set("freeDeliveryAbove", Number(v))} />
        </Field>
        <Field label="Minimum Order Amount (₹)">
          <Input type="number" value={form.minimumOrderAmount} onChange={(v) => set("minimumOrderAmount", Number(v))} />
        </Field>
        <Field label="Maximum Order Amount (₹)">
          <Input type="number" value={form.maximumOrderAmount} onChange={(v) => set("maximumOrderAmount", Number(v))} />
        </Field>
      </div>
      <Toggle checked={form.allowScheduledDelivery} onChange={(v) => set("allowScheduledDelivery", v)} label="Allow scheduled delivery" />
      <SaveButton saving={saving} onClick={() => onSubmit(form)} />
    </div>
  );
}

/* ─── Pincodes Tab ─── */
function PincodesTab({
  saving,
  pincodes,
  onAdd,
  onUpdate,
  onDelete,
}: {
  saving: boolean;
  pincodes: PincodeData[];
  onAdd: (d: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, d: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ pincode: "", city: "", state: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!form.pincode) return;
    await onAdd({ ...form, isActive: true });
    setForm({ pincode: "", city: "", state: "" });
    setShowAdd(false);
  };

  const handleUpdate = async (id: string) => {
    await onUpdate(id, form);
    setEditingId(null);
    setForm({ pincode: "", city: "", state: "" });
  };

  const startEdit = (p: PincodeData) => {
    setEditingId(p.id);
    setForm({ pincode: p.pincode, city: p.city || "", state: p.state || "" });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Serviceable Pincodes</h3>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ pincode: "", city: "", state: "" }); }}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Pincode
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="border-b border-gray-100 bg-gray-50/50 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Input value={form.pincode} onChange={(v) => setForm((p) => ({ ...p, pincode: v }))} placeholder="Pincode" />
            <Input value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} placeholder="City" />
            <Input value={form.state} onChange={(v) => setForm((p) => ({ ...p, state: v }))} placeholder="State" />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving || !form.pincode}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add
              </button>
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Pincode</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">City</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">State</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pincodes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No pincodes configured. Add your first serviceable pincode.
                </td>
              </tr>
            ) : (
              pincodes.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  {editingId === p.id ? (
                    <>
                      <td className="px-6 py-3"><input value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} className="h-8 w-full rounded border border-gray-200 px-2 text-sm" /></td>
                      <td className="px-6 py-3"><input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="h-8 w-full rounded border border-gray-200 px-2 text-sm" /></td>
                      <td className="px-6 py-3"><input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="h-8 w-full rounded border border-gray-200 px-2 text-sm" /></td>
                      <td className="px-6 py-3">—</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleUpdate(p.id)} disabled={saving} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600">Save</button>
                          <button onClick={() => setEditingId(null)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3 font-semibold text-gray-900">{p.pincode}</td>
                      <td className="px-6 py-3 text-gray-600">{p.city || "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{p.state || "—"}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { startEdit(p); setShowAdd(false); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {deleteId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={async () => { await onDelete(p.id); setDeleteId(null); }} disabled={saving} className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600">Confirm</button>
                              <button onClick={() => setDeleteId(null)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteId(p.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Delivery Providers Tab ─── */
function DeliveryProvidersTab() {
  const {
    settings,
    providers,
    health,
    loading,
    saving,
    testing,
    error,
    successMessage,
    loadSettings,
    updateSettings,
    updateProvider,
    testConnection,
    runHealthChecks,
    clearMessages,
  } = useDeliveryProviderStore();

  const [activeSection, setActiveSection] = useState<"strategy" | "providers" | "health" | "logs">("strategy");
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [providerForm, setProviderForm] = useState({
    apiKey: "",
    apiSecret: "",
    webhookSecret: "",
    apiBaseUrl: "",
    environment: "sandbox",
    enabled: false,
    priority: 0,
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (successMessage || error) {
      const t = setTimeout(clearMessages, 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, error, clearMessages]);

  const handleSaveStrategy = async () => {
    if (!settings) return;
    await updateSettings({
      primaryProvider: settings.primaryProvider,
      fallbackProvider: settings.fallbackProvider,
      activeStrategy: settings.activeStrategy,
      autoFallback: settings.autoFallback,
      retryCount: settings.retryCount,
      retryDelay: settings.retryDelay,
      providerTimeout: settings.providerTimeout,
      healthCheckInterval: settings.healthCheckInterval,
      sandboxMode: settings.sandboxMode,
      enableLogging: settings.enableLogging,
      enableHealthChecks: settings.enableHealthChecks,
    });
  };

  const handleTestConnection = async (provider: string) => {
    await testConnection(provider);
  };

  const handleSaveProvider = async () => {
    if (!editingProvider) return;
    const updateData: Record<string, unknown> = {};
    if (providerForm.apiKey) updateData.apiKey = providerForm.apiKey;
    if (providerForm.apiSecret) updateData.apiSecret = providerForm.apiSecret;
    if (providerForm.webhookSecret) updateData.webhookSecret = providerForm.webhookSecret;
    if (providerForm.apiBaseUrl) updateData.apiBaseUrl = providerForm.apiBaseUrl;
    updateData.environment = providerForm.environment;
    updateData.enabled = providerForm.enabled;
    updateData.priority = providerForm.priority;

    await updateProvider(editingProvider, updateData);
    setEditingProvider(null);
    setProviderForm({ apiKey: "", apiSecret: "", webhookSecret: "", apiBaseUrl: "", environment: "sandbox", enabled: false, priority: 0 });
  };

  const startEditProvider = (config: any) => {
    setEditingProvider(config.id);
    setProviderForm({
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      apiBaseUrl: config.apiBaseUrl || "",
      environment: config.environment || "sandbox",
      enabled: config.enabled,
      priority: config.priority,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-sm text-gray-500">Loading delivery provider settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" />{successMessage}
          <button onClick={clearMessages} className="ml-auto"><X className="h-4 w-4" /></button>
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />{error}
          <button onClick={clearMessages} className="ml-auto"><X className="h-4 w-4" /></button>
        </motion.div>
      )}

      <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {([
          { key: "strategy" as const, label: "Strategy", icon: Zap },
          { key: "providers" as const, label: "Providers", icon: Server },
          { key: "health" as const, label: "Health Dashboard", icon: Activity },
          { key: "logs" as const, label: "Event Logs", icon: Shield },
        ]).map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveSection(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                active ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeSection === "strategy" && settings && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Delivery Strategy</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Active Strategy">
              <select value={settings.activeStrategy} onChange={(e) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, activeStrategy: e.target.value } : null }))}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300">
                <option value="PRIMARY_FALLBACK">Primary + Fallback</option>
                <option value="CHEAPEST_QUOTE">Cheapest Quote</option>
                <option value="FASTEST_ETA">Fastest ETA</option>
                <option value="ROUND_ROBIN">Round Robin</option>
                <option value="MANUAL">Manual Provider</option>
              </select>
            </Field>
            <Field label="Primary Provider">
              <select value={settings.primaryProvider ?? ""} onChange={(e) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, primaryProvider: e.target.value } : null }))}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300">
                <option value="">None</option>
                <option value="SHADOWFAX">Shadowfax</option>
                <option value="BORZO">Borzo</option>
                <option value="PORTER">Porter</option>
                <option value="SHIPROCKET">Shiprocket</option>
              </select>
            </Field>
            <Field label="Fallback Provider">
              <select value={settings.fallbackProvider ?? ""} onChange={(e) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, fallbackProvider: e.target.value } : null }))}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300">
                <option value="">None</option>
                <option value="SHADOWFAX">Shadowfax</option>
                <option value="BORZO">Borzo</option>
                <option value="PORTER">Porter</option>
                <option value="SHIPROCKET">Shiprocket</option>
              </select>
            </Field>
            <Field label="Retry Count">
              <Input type="number" value={settings.retryCount} onChange={(v) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, retryCount: Number(v) } : null }))} />
            </Field>
            <Field label="Retry Delay (ms)">
              <Input type="number" value={settings.retryDelay} onChange={(v) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, retryDelay: Number(v) } : null }))} />
            </Field>
            <Field label="Provider Timeout (ms)">
              <Input type="number" value={settings.providerTimeout} onChange={(v) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, providerTimeout: Number(v) } : null }))} />
            </Field>
            <Field label="Health Check Interval (ms)">
              <Input type="number" value={settings.healthCheckInterval} onChange={(v) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, healthCheckInterval: Number(v) } : null }))} />
            </Field>
          </div>
          <div className="space-y-4">
            <Toggle checked={settings.autoFallback} onChange={(v) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, autoFallback: v } : null }))} label="Auto Fallback" />
            <Toggle checked={settings.sandboxMode} onChange={(v) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, sandboxMode: v } : null }))} label="Sandbox Mode" />
            <Toggle checked={settings.enableLogging} onChange={(v) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, enableLogging: v } : null }))} label="Enable Logging" />
            <Toggle checked={settings.enableHealthChecks} onChange={(v) => useDeliveryProviderStore.setState((s) => ({ settings: s.settings ? { ...s.settings, enableHealthChecks: v } : null }))} label="Enable Health Checks" />
          </div>
          <SaveButton saving={saving} onClick={handleSaveStrategy} />
        </div>
      )}

      {activeSection === "providers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Provider Configurations</h3>
            <button onClick={runHealthChecks} disabled={testing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Run Health Checks
            </button>
          </div>

          {["SHADOWFAX", "BORZO", "PORTER", "SHIPROCKET"].map((providerName) => {
            const config = providers.find((p) => p.provider === providerName);
            const healthData = health.find((h) => h.provider === providerName);
            const isEditing = editingProvider === config?.id;

            return (
              <motion.div key={providerName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                      providerName === "SHADOWFAX" ? "bg-blue-500" :
                      providerName === "BORZO" ? "bg-emerald-500" :
                      providerName === "PORTER" ? "bg-purple-500" : "bg-orange-500"
                    }`}>
                      {providerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{PROVIDER_LABELS[providerName] ?? providerName}</h4>
                      <p className="text-xs text-gray-500">
                        {config?.enabled ? "Enabled" : "Disabled"} · {config?.environment ?? "sandbox"} · Priority {config?.priority ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      healthData?.isHealthy ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      {healthData?.isHealthy ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      {healthData?.isHealthy ? "Healthy" : "Unhealthy"}
                    </span>
                    <button onClick={() => handleTestConnection(providerName)} disabled={testing}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                      Test
                    </button>
                    <button onClick={() => config && startEditProvider(config)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                      Configure
                    </button>
                  </div>
                </div>

                {healthData && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-400">Avg Response</span>
                      <p className="font-semibold text-gray-900">{healthData.averageResponseTime ?? 0}ms</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Success Rate</span>
                      <p className="font-semibold text-gray-900">{healthData.successRate ?? 100}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Failed</span>
                      <p className="font-semibold text-gray-900">{healthData.failedRequests}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Last Check</span>
                      <p className="font-semibold text-gray-900">{healthData.lastHealthCheckAt ? new Date(healthData.lastHealthCheckAt).toLocaleString() : "Never"}</p>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                    <h5 className="font-bold text-gray-700">Configure {PROVIDER_LABELS[providerName]}</h5>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="API Base URL">
                        <Input value={providerForm.apiBaseUrl} onChange={(v) => setProviderForm((p) => ({ ...p, apiBaseUrl: v }))} placeholder="https://api.borzo.com" />
                      </Field>
                      <Field label="Environment">
                        <select value={providerForm.environment} onChange={(e) => setProviderForm((p) => ({ ...p, environment: e.target.value }))}
                          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300">
                          <option value="sandbox">Sandbox</option>
                          <option value="production">Production</option>
                        </select>
                      </Field>
                      <Field label="API Key">
                        <Input type="password" value={providerForm.apiKey} onChange={(v) => setProviderForm((p) => ({ ...p, apiKey: v }))} placeholder="Enter API key" />
                      </Field>
                      <Field label="API Secret">
                        <Input type="password" value={providerForm.apiSecret} onChange={(v) => setProviderForm((p) => ({ ...p, apiSecret: v }))} placeholder="Enter API secret" />
                      </Field>
                      <Field label="Webhook Secret">
                        <Input type="password" value={providerForm.webhookSecret} onChange={(v) => setProviderForm((p) => ({ ...p, webhookSecret: v }))} placeholder="Enter webhook secret" />
                      </Field>
                      <Field label="Priority">
                        <Input type="number" value={providerForm.priority} onChange={(v) => setProviderForm((p) => ({ ...p, priority: Number(v) }))} />
                      </Field>
                    </div>
                    <div className="flex items-center justify-between">
                      <Toggle checked={providerForm.enabled} onChange={(v) => setProviderForm((p) => ({ ...p, enabled: v }))} label="Enabled" />
                      <div className="flex gap-2">
                        <button onClick={handleSaveProvider} disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50">
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save
                        </button>
                        <button onClick={() => { setEditingProvider(null); setProviderForm({ apiKey: "", apiSecret: "", webhookSecret: "", apiBaseUrl: "", environment: "sandbox", enabled: false, priority: 0 }); }}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {activeSection === "health" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Provider Health Dashboard</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Provider</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Avg Response</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Success Rate</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Failed</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Last Error</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Last Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {health.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">No health data available. Run health checks first.</td></tr>
                ) : (
                  health.map((h) => (
                    <tr key={h.provider} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-semibold text-gray-900">{PROVIDER_LABELS[h.provider] ?? h.provider}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${h.isHealthy ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {h.isHealthy ? "Healthy" : "Unhealthy"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{h.averageResponseTime ?? 0}ms</td>
                      <td className="px-6 py-3 text-gray-600">{h.successRate}%</td>
                      <td className="px-6 py-3 text-gray-600">{h.failedRequests}</td>
                      <td className="px-6 py-3 text-gray-600 max-w-[200px] truncate">{h.lastError ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{h.lastHealthCheckAt ? new Date(h.lastHealthCheckAt).toLocaleString() : "Never"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === "logs" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Delivery Event Logs</h3>
            <p className="text-sm text-gray-500 mt-1">Track all provider dispatch, tracking, and webhook events.</p>
          </div>
          <div className="p-6 text-center text-sm text-gray-400">
            Event logs will be populated as deliveries are processed through the provider architecture.
          </div>
        </div>
      )}
    </div>
  );
}
