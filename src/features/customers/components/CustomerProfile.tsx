"use client";

import { useCustomerStore } from "../hooks/useCustomers";
import { X, Phone, Mail, Calendar, Clock, Shield, ChevronRight, User } from "lucide-react";
import type { Customer } from "../types/customer";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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

export function CustomerProfile() {
  const selectedCustomer = useCustomerStore((s) => s.selectedCustomer);
  const drawerOpen = useCustomerStore((s) => s.drawerOpen);
  const setDrawerOpen = useCustomerStore((s) => s.setDrawerOpen);

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
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${
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
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <InformationSection customer={selectedCustomer} />
          </div>
        </div>
      </div>
    </>
  );
}
