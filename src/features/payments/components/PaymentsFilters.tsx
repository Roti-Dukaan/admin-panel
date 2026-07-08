"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, Search, X, ChevronDown, Check } from "lucide-react";
import { usePaymentStore } from "../hooks/usePayments";
import type { PaymentStatus, PaymentMethodType, DateFilter } from "../types/payment";
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from "../types/payment";

const STATUS_OPTIONS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'authorized', label: 'Authorized' },
  { value: 'refunded', label: 'Refunded' },
];

const METHOD_OPTIONS: { value: PaymentMethodType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Methods' },
  { value: 'upi', label: 'UPI' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'cod', label: 'COD' },
];

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

function SelectDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 hover:border-gray-300 transition-colors"
      >
        <span className="truncate">{selected?.label || 'Select'}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto py-1">
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {isActive && <Check className="h-4 w-4 text-gray-900" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function PaymentsFilters() {
  const filters = usePaymentStore((s) => s.filters);
  const setFilters = usePaymentStore((s) => s.setFilters);
  const clearFilters = usePaymentStore((s) => s.clearFilters);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeCount = [
    filters.status !== 'all',
    filters.method !== 'all',
    filters.dateFilter !== 'last_30_days',
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Search by Payment ID, Order ID, Customer or Phone..."
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>

      {/* Filters Button + Dropdown */}
      <div ref={panelRef} className="relative">
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-900 px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {panelOpen && (
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-900">Filters</h4>
              {activeCount > 0 && (
                <button
                  onClick={() => { clearFilters(); setPanelOpen(false); }}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              <SelectDropdown
                label="Payment Status"
                value={filters.status}
                options={STATUS_OPTIONS}
                onChange={(val) => setFilters({ status: val as PaymentStatus | 'all' })}
              />

              <SelectDropdown
                label="Payment Method"
                value={filters.method}
                options={METHOD_OPTIONS}
                onChange={(val) => setFilters({ method: val as PaymentMethodType | 'all' })}
              />

              <SelectDropdown
                label="Date Range"
                value={filters.dateFilter}
                options={DATE_OPTIONS}
                onChange={(val) => setFilters({ dateFilter: val as DateFilter })}
              />

              {filters.dateFilter === 'custom' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Custom Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.customDateFrom}
                      onChange={(e) => setFilters({ customDateFrom: e.target.value })}
                      className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <input
                      type="date"
                      value={filters.customDateTo}
                      onChange={(e) => setFilters({ customDateTo: e.target.value })}
                      className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setPanelOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
