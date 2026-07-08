"use client";

import { useCustomerStore } from "../hooks/useCustomers";
import {
  X,
  User,
  MapPin,
  ShoppingBag,
  Repeat,
  CreditCard,
  Sparkles,
  Clock,
  Mail,
  Phone,
  Calendar,
  Shield,
  Star,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Customer, SUBSCRIPTION_PLAN_CONFIG, ORDER_STATUS_CONFIG } from "../types/customer";

const drawerSections = [
  { key: "information", label: "Information", icon: User },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "subscription", label: "Subscription", icon: Repeat },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "insights", label: "Insights", icon: Sparkles },
  { key: "timeline", label: "Timeline", icon: Clock },
];

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getTimelineIcon(type: string) {
  switch (type) {
    case "created": return <User className="h-4 w-4" />;
    case "address-added": return <MapPin className="h-4 w-4" />;
    case "first-order": return <ShoppingBag className="h-4 w-4" />;
    case "subscription-started": return <Repeat className="h-4 w-4" />;
    case "latest-order": return <ShoppingBag className="h-4 w-4" />;
    case "latest-login": return <Clock className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

function getTimelineColor(type: string) {
  switch (type) {
    case "created": return "bg-blue-100 text-blue-600";
    case "address-added": return "bg-amber-100 text-amber-600";
    case "first-order": return "bg-emerald-100 text-emerald-600";
    case "subscription-started": return "bg-violet-100 text-violet-600";
    case "latest-order": return "bg-orange-100 text-orange-600";
    case "latest-login": return "bg-gray-100 text-gray-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

function InformationSection({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xl font-bold text-orange-600">
            {getInitials(customer.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
              {customer.isVip && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  <Star className="h-3 w-3" /> VIP
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 capitalize">{customer.gender} · {customer.dateOfBirth}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Phone className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Phone</p>
            <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Mail className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Email</p>
            <p className="text-sm font-medium text-gray-900">{customer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Registered</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(customer.registeredAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Last Login</p>
            <p className="text-sm font-medium text-gray-900">{formatDateTime(customer.lastLogin)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Shield className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</p>
            <div className="flex items-center gap-2 mt-0.5">
              {customer.status === "active" ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">Inactive</span>
              )}
              {customer.isRepeatCustomer && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Repeat</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressesSection({ customer }: { customer: Customer }) {
  if (customer.addresses.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No addresses saved.</p>;
  }
  return (
    <div className="space-y-3">
      {customer.addresses.map((addr) => (
        <div key={addr.id} className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
              <MapPin className="h-3.5 w-3.5" />
              {addr.label}
            </span>
            {addr.isDefault && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Default</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">{addr.line1}</p>
          <p className="text-sm text-gray-600">{addr.area}, {addr.city}</p>
          <p className="text-sm text-gray-500">{addr.state} - {addr.pincode}</p>
          {addr.landmark && <p className="text-xs text-gray-400 mt-1">Landmark: {addr.landmark}</p>}
        </div>
      ))}
    </div>
  );
}

function OrdersSection({ customer }: { customer: Customer }) {
  if (customer.orders.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No orders yet.</p>;
  }
  return (
    <div className="space-y-3">
      {customer.orders.map((order) => {
        const statusCfg = ORDER_STATUS_CONFIG[order.status];
        return (
          <div key={order.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">#{order.orderId}</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusCfg.color} ${statusCfg.bgColor}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{formatDate(order.date)} · {order.deliverySlot}</p>
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <p key={i} className="text-sm text-gray-700">
                  {item.quantity}x {item.name}
                </p>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-500 capitalize">{order.paymentMethod}</span>
              <span className="text-sm font-bold text-gray-900">₹{order.amount}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubscriptionSection({ customer }: { customer: Customer }) {
  if (!customer.subscription) {
    return (
      <div className="text-center py-8">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-gray-100 mb-3">
          <Repeat className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No active subscription</p>
      </div>
    );
  }
  const sub = customer.subscription;
  const cfg = SUBSCRIPTION_PLAN_CONFIG[sub.plan];
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${cfg.bgColor} border-current/20`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-lg font-bold ${cfg.color}`}>{cfg.label} Plan</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color} ${cfg.bgColor}`}>
            {sub.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Daily Quantity</p>
            <p className="text-sm font-semibold text-gray-900">{sub.dailyQuantity} rotis/day</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivery Slot</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{sub.deliverySlot}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Started On</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(sub.startedOn)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Renewal Date</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(sub.renewalDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsSection({ customer }: { customer: Customer }) {
  if (customer.payments.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No payment history.</p>;
  }
  const totalSpent = customer.payments.reduce((s, p) => s + p.amount, 0);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{customer.payments.length}</p>
        </div>
      </div>
      <div className="space-y-2">
        {customer.payments.map((pay) => (
          <div key={pay.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">#{pay.orderId}</p>
              <p className="text-xs text-gray-500">{formatDate(pay.date)} · {pay.method}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">₹{pay.amount}</p>
              <span className={`text-[11px] font-semibold ${pay.status === "success" ? "text-emerald-600" : pay.status === "pending" ? "text-amber-600" : "text-red-600"}`}>
                {pay.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsSection({ customer }: { customer: Customer }) {
  const { insights } = customer;
  const items = [
    { label: "Favourite Roti", value: insights.favouriteRoti },
    { label: "Favourite Curry", value: insights.favouriteCurry },
    { label: "Favourite Combo", value: insights.favouriteCombo },
    { label: "Preferred Delivery Slot", value: insights.preferredDeliverySlot },
    { label: "Preferred Payment", value: insights.preferredPaymentMethod },
    { label: "Most Ordered Meal", value: insights.mostOrderedMeal },
    { label: "Avg Monthly Spend", value: `₹${insights.averageMonthlySpend.toLocaleString("en-IN")}` },
  ];
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{item.label}</span>
          <span className="text-sm font-semibold text-gray-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function TimelineSection({ customer }: { customer: Customer }) {
  if (customer.timeline.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No timeline events.</p>;
  }
  return (
    <div className="relative ml-3 border-l-2 border-gray-100 pl-6 space-y-6">
      {customer.timeline.map((event) => (
        <div key={event.id} className="relative">
          <div className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ${getTimelineColor(event.type)}`}>
            {getTimelineIcon(event.type)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{event.label}</p>
            <p className="text-xs text-gray-500">{formatDateTime(event.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CustomerProfile() {
  const selectedCustomer = useCustomerStore((s) => s.selectedCustomer);
  const drawerOpen = useCustomerStore((s) => s.drawerOpen);
  const drawerSection = useCustomerStore((s) => s.drawerSection);
  const setDrawerOpen = useCustomerStore((s) => s.setDrawerOpen);
  const setDrawerSection = useCustomerStore((s) => s.setDrawerSection);

  if (!selectedCustomer) return null;

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
                {getInitials(selectedCustomer.name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h2>
                <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-48 shrink-0 border-r border-gray-100 p-3 space-y-1 overflow-y-auto">
              {drawerSections.map((section) => {
                const Icon = section.icon;
                const active = drawerSection === section.key;
                return (
                  <button
                    key={section.key}
                    onClick={() => setDrawerSection(section.key)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {section.label}
                    {active && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </button>
                );
              })}
            </div>

            {/* Section Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {drawerSection === "information" && <InformationSection customer={selectedCustomer} />}
              {drawerSection === "addresses" && <AddressesSection customer={selectedCustomer} />}
              {drawerSection === "orders" && <OrdersSection customer={selectedCustomer} />}
              {drawerSection === "subscription" && <SubscriptionSection customer={selectedCustomer} />}
              {drawerSection === "payments" && <PaymentsSection customer={selectedCustomer} />}
              {drawerSection === "insights" && <InsightsSection customer={selectedCustomer} />}
              {drawerSection === "timeline" && <TimelineSection customer={selectedCustomer} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
