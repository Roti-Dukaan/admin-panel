"use client";

import { useEffect, useState } from "react";
import { useCustomerStore } from "../hooks/useCustomers";
import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  Shield,
  MapPin,
  Home,
  Building2,
  Star,
  Loader2,
  ShoppingBag,
  Package,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Customer } from "../types/customer";
import {
  customerApi,
  type ApiCustomerAddress,
  type ApiCustomerOrder,
  type ApiCustomerCart,
} from "@/lib/api/customer.api";
import { CustomerOrderCountBadge } from "@/features/kitchen/components/CustomerOrderCountBadge";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatOrderStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const ADDRESS_TYPE_ICONS: Record<string, typeof Home> = {
  HOME: Home,
  WORK: Building2,
  OTHER: MapPin,
};

function InformationSection({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xl font-bold text-orange-600">
            {getInitials(customer.name)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-500">{customer.gender || "No gender set"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Phone className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Phone</p>
            <p className="text-sm font-medium text-gray-900">{customer.phone || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Mail className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Email</p>
            <p className="text-sm font-medium text-gray-900">{customer.email || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Registered</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Last Login</p>
            <p className="text-sm font-medium text-gray-900">
              {customer.lastLoginAt ? formatDateTime(customer.lastLoginAt) : "Never"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <ShoppingBag className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Orders</p>
            <p className="text-sm font-medium text-gray-900">{customer.totalOrderCount ?? 0}</p>
          </div>
        </div>
        {(customer.activeKitchenOrderCount ?? 0) > 1 && (
          <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-3">
            <CustomerOrderCountBadge
              count={customer.activeKitchenOrderCount ?? 0}
              customerName={customer.name}
            />
          </div>
        )}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
          <Shield className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</p>
            <div className="flex items-center gap-2 mt-0.5">
              {customer.isActive ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">Inactive</span>
              )}
              {customer.isVerified && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressCard({ address }: { address: ApiCustomerAddress }) {
  const Icon = ADDRESS_TYPE_ICONS[address.label] || MapPin;
  const label = address.label.charAt(0) + address.label.slice(1).toLowerCase();

  return (
    <div className="rounded-lg border border-gray-100 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-50">
            <Icon className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <span className="text-xs font-bold text-gray-900">{label}</span>
          {address.isDefault && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">
              <Star className="h-2.5 w-2.5 fill-orange-400" />
              Default
            </span>
          )}
        </div>
        {address.isServiceable && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            Serviceable
          </span>
        )}
      </div>
      <div className="text-xs text-gray-600 leading-relaxed">
        <p className="font-medium text-gray-900">{address.receiverName} · {address.phoneNumber}</p>
        <p>{address.houseNumber}{address.apartment ? `, ${address.apartment}` : ""}</p>
        <p>{[address.street, address.area].filter(Boolean).join(", ")}</p>
        {address.landmark && <p className="text-gray-400">Near {address.landmark}</p>}
        <p>{address.city}, {address.state} - {address.pincode}</p>
        {address.deliveryInstructions && (
          <p className="mt-1 italic text-gray-400">&quot;{address.deliveryInstructions}&quot;</p>
        )}
      </div>
    </div>
  );
}

function AddressesSection() {
  const customerAddresses = useCustomerStore((s) => s.customerAddresses);
  const addressesLoading = useCustomerStore((s) => s.addressesLoading);
  const selectedCustomer = useCustomerStore((s) => s.selectedCustomer);
  const fetchCustomerAddresses = useCustomerStore((s) => s.fetchCustomerAddresses);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerAddresses(selectedCustomer.id);
    }
  }, [selectedCustomer, fetchCustomerAddresses]);

  if (addressesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (customerAddresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <MapPin className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-900">No addresses saved</p>
        <p className="text-xs text-gray-500">This customer hasn&apos;t added any delivery addresses yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Delivery Addresses ({customerAddresses.length})
        </p>
      </div>
      {customerAddresses.map((addr) => (
        <AddressCard key={addr.id} address={addr} />
      ))}
    </div>
  );
}

function OrdersSection({ customer }: { customer: Customer }) {
  const [orders, setOrders] = useState<ApiCustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    customerApi
      .getOrders(customer.id, { page, limit: 8 })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer.id, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-900">No orders yet</p>
        <p className="text-xs text-gray-500">This customer hasn&apos;t placed any orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Past Orders ({total})
        </p>
        {(customer.activeKitchenOrderCount ?? 0) > 1 && (
          <CustomerOrderCountBadge
            count={customer.activeKitchenOrderCount ?? 0}
            customerName={customer.name}
          />
        )}
      </div>

      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border border-gray-100 p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
              <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
              {formatOrderStatus(order.status)}
            </span>
          </div>
          <ul className="space-y-1">
            {order.items.map((item, index) => (
              <li key={`${order.id}-${index}`} className="text-xs text-gray-600">
                {item.quantity} × {item.foodNameSnapshot}
              </li>
            ))}
            {order.itemCount > order.items.length && (
              <li className="text-xs text-gray-400">
                +{order.itemCount - order.items.length} more item{order.itemCount - order.items.length === 1 ? "" : "s"}
              </li>
            )}
          </ul>
          <div className="flex items-center justify-between border-t border-gray-50 pt-2 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
              <IndianRupee className="h-3 w-3" />
              {formatPrice(order.grandTotal)}
            </span>
            <span className="text-gray-500">
              {order.paymentMethod ?? "—"} · {order.totalQuantity} item{order.totalQuantity === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
          >
            <ChevronLeft className="h-3 w-3" /> Prev
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
          >
            Next <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function CartSection({ customer }: { customer: Customer }) {
  const [cart, setCart] = useState<ApiCustomerCart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    customerApi
      .getCart(customer.id)
      .then((res) => {
        if (!cancelled) setCart(res.data.cart);
      })
      .catch(() => {
        if (!cancelled) setCart(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-900">Cart is empty</p>
        <p className="text-xs text-gray-500">No items in this customer&apos;s active cart.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Active Cart ({cart.totalQuantity} items)
        </p>
        <p className="text-xs text-gray-500">Updated {formatDateTime(cart.updatedAt)}</p>
      </div>

      {cart.items.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {item.quantity} × {item.foodNameSnapshot}
            </p>
            {item.categorySnapshot && (
              <p className="text-xs text-gray-500">{item.categorySnapshot}</p>
            )}
          </div>
          <span className="text-sm font-semibold text-gray-900">{formatPrice(item.lineTotal)}</span>
        </div>
      ))}

      <div className="rounded-lg bg-orange-50 px-3 py-2.5 space-y-1">
        <div className="flex items-center justify-between text-sm font-bold text-gray-900">
          <span>Cart total</span>
          <span className="inline-flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5" />
            {formatPrice(cart.grandTotal)}
          </span>
        </div>
        {cart.paymentMethod && (
          <p className="text-xs text-gray-600">Payment: {cart.paymentMethod}</p>
        )}
        {cart.specialInstructions && (
          <p className="text-xs italic text-gray-500">&quot;{cart.specialInstructions}&quot;</p>
        )}
      </div>
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
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
                {getInitials(selectedCustomer.name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h2>
                <p className="text-xs text-gray-500">{selectedCustomer.phone || selectedCustomer.email}</p>
                {(selectedCustomer.activeKitchenOrderCount ?? 0) > 1 && (
                  <div className="mt-1">
                    <CustomerOrderCountBadge
                      count={selectedCustomer.activeKitchenOrderCount ?? 0}
                      customerName={selectedCustomer.name}
                    />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
            {(["information", "addresses", "orders", "cart"] as const).map((section) => (
              <button
                key={section}
                onClick={() => setDrawerSection(section)}
                className={`relative mr-4 shrink-0 px-1 py-3 text-xs font-semibold capitalize transition-colors ${
                  drawerSection === section ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {section}
                {drawerSection === section && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {drawerSection === "information" && <InformationSection customer={selectedCustomer} />}
            {drawerSection === "addresses" && <AddressesSection />}
            {drawerSection === "orders" && <OrdersSection customer={selectedCustomer} />}
            {drawerSection === "cart" && <CartSection customer={selectedCustomer} />}
          </div>
        </div>
      </div>
    </>
  );
}
