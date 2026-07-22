"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useManagerProduction } from "@/features/subscription-production/hooks/useSubscriptionProduction";
import { ProductionStatusBadge, StatusSelect } from "@/features/subscription-production/components/ProductionStatusBadge";
import { ProductionSummaryCards } from "@/features/subscription-production/components/ProductionSummaryCards";
import { ProductionTable } from "@/features/subscription-production/components/ProductionTable";
import { subscriptionProductionApi, type ProductionQueryParams } from "@/lib/api/subscription-production.api";
import { Search, Calendar, Store, Clock, CheckCircle, XCircle, AlertTriangle, Loader2, TrendingUp, BarChart3, Package, User, UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";
import { DELIVERY_SLOT_LABELS } from "@/features/subscription-production/types/subscription-production";

export default function BranchManagerProductionPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>(undefined);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'upcoming' | 'cooking-sheet'>(selectedDate === new Date().toISOString().split('T')[0] ? 'today' : 'tomorrow');

  const { items, summary, loading, filters, setFilters, refresh } = useManagerProduction();

  const handleStatusChange = async (item: any, newStatus: string) => {
    try {
      const res = await subscriptionProductionApi.managerUpdateStatus(item.id, { status: newStatus as any });
      if (res.success) {
        refresh();
      }
    } catch {
      // handled
    }
  };

  const handleFiltersChange = (key: keyof ProductionQueryParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const getBranchProductions = () => {
    return items.filter(item => item.branchId === summary?.branchId);
  };

  const getTodayProductions = () => {
    const today = new Date().toISOString().split('T')[0];
    return getBranchProductions().filter(item => item.productionDate === today);
  };

  const getTomorrowProductions = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return getBranchProductions().filter(item => item.productionDate === tomorrowStr);
  };

  const getUpcomingProductions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return items.filter(item => {
      const productionDate = new Date(item.productionDate);
      return productionDate >= today && productionDate <= tomorrow;
    });
  };

  const getTodaySummary = () => {
    const today = new Date().toISOString().split('T')[0];
    const productions = getBranchProductions().filter(item => item.productionDate === today);
    const totalItems = productions.reduce((sum, item) => sum + (item.items?.reduce((itemSum, it) => itemSum + it.quantity, 0) || 0), 0);

    return {
      totalProductions: productions.length,
      totalItems: totalItems,
      byStatus: productions.reduce((acc, item) => {
        const status = item.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySlot: productions.reduce((acc, item) => {
        const slot = item.deliverySlot;
        acc[slot] = (acc[slot] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  };

  const getTomorrowSummary = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const productions = getBranchProductions().filter(item => item.productionDate === tomorrowStr);
    const totalItems = productions.reduce((sum, item) => sum + (item.items?.reduce((itemSum, it) => itemSum + it.quantity, 0) || 0), 0);

    return {
      totalProductions: productions.length,
      totalItems: totalItems,
      byStatus: productions.reduce((acc, item) => {
        const status = item.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySlot: productions.reduce((acc, item) => {
        const slot = item.deliverySlot;
        acc[slot] = (acc[slot] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  };

  const getExpansionDate = () => {
    switch (activeTab) {
      case 'today': return new Date().toISOString().split('T')[0];
      case 'tomorrow':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      default: return selectedDate;
    }
  };

  const todaySummary = getTodaySummary();
  const tomorrowSummary = getTomorrowSummary();

  const renderTodayView = () => {
    const productions = getTodayProductions();
    const filteredProductions = selectedSlot
      ? productions.filter(item => item.deliverySlot === selectedSlot)
      : productions;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="h-6 w-6 text-orange-600" />
              Today's Production Board
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Delivery Slot:</span>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">All Slots</option>
              {Object.entries(DELIVERY_SLOT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Productions</p>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{filteredProductions.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Items</p>
              <UtensilsCrossed className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredProductions.reduce((sum, item) => sum + (item.items?.reduce((itSum, it) => itSum + it.quantity, 0) || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Completed</p>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {filteredProductions.filter(p => p.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Pending</p>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {filteredProductions.filter(p => p.status === 'PENDING').length}
            </p>
          </div>
        </div>

        <ProductionTable
          items={filteredProductions}
          loading={loading}
          showBranch={false}
          showDeliverySlot={false}
          showSubscription={true}
          onStatusChange={handleStatusChange}
        />
      </div>
    );
  };

  const renderTomorrowView = () => {
    const productions = getTomorrowProductions();
    const filteredProductions = selectedSlot
      ? productions.filter(item => item.deliverySlot === selectedSlot)
      : productions;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-600" />
              Tomorrow's Production Board
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Delivery Slot:</span>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">All Slots</option>
              {Object.entries(DELIVERY_SLOT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Productions</p>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{filteredProductions.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Items</p>
              <UtensilsCrossed className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredProductions.reduce((sum, item) => sum + (item.items?.reduce((itSum, it) => itSum + it.quantity, 0) || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Completed</p>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {filteredProductions.filter(p => p.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Pending</p>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {filteredProductions.filter(p => p.status === 'PENDING').length}
            </p>
          </div>
        </div>

        <ProductionTable
          items={filteredProductions}
          loading={loading}
          showBranch={false}
          showDeliverySlot={false}
          showSubscription={true}
          onStatusChange={handleStatusChange}
        />
      </div>
    );
  };

  const renderUpcomingView = () => {
    const productions = getUpcomingProductions();
    const filteredProductions = selectedSlot
      ? productions.filter(item => item.deliverySlot === selectedSlot)
      : productions;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-orange-600" />
            Upcoming Productions
          </h1>
          <p className="text-gray-600 mt-1">
            All productions scheduled for today and tomorrow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Productions</p>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{filteredProductions.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Items</p>
              <UtensilsCrossed className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredProductions.reduce((sum, item) => sum + (item.items?.reduce((itSum, it) => itSum + it.quantity, 0) || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Completed</p>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {filteredProductions.filter(p => p.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Pending</p>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {filteredProductions.filter(p => p.status === 'PENDING').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Slot-Grouped View</h2>
          {Object.entries(
            filteredProductions.reduce((acc, item) => {
              if (!acc[item.deliverySlot]) {
                acc[item.deliverySlot] = {
                  slot: item.deliverySlot,
                  productions: [],
                };
              }
              acc[item.deliverySlot].productions.push(item);
              return acc;
            }, {} as Record<string, { slot: string; productions: any[] }>)
          ).map(([slot, group]) => (
            <div key={slot} className="mb-6 last:mb-0">
              <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                {DELIVERY_SLOT_LABELS[slot as keyof typeof DELIVERY_SLOT_LABELS] || slot}
                <span className="text-sm text-gray-500">({group.productions.length} productions)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.productions.map((production) => (
                  <div
                    key={production.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedCustomers(prev =>
                      prev.has(production.subscription?.customer?.id || '')
                        ? new Set([...prev].filter(id => id !== production.subscription?.customer?.id))
                        : new Set([...prev, production.subscription?.customer?.id || ''])
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 text-sm">
                          {production.subscription?.customer?.fullName || 'Unknown'}
                        </span>
                      </div>
                      <ProductionStatusBadge status={production.status as any} />
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <UtensilsCrossed className="h-3 w-3" />
                        <span>{production.items?.reduce((sum, i) => sum + i.quantity, 0) || 0} items</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{production.productionDate}</span>
                      </div>
                    </div>
                    {expandedCustomers.has(production.subscription?.customer?.id || '') && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs font-medium text-gray-700 mb-2">Food Items</div>
                        <div className="space-y-1">
                          {production.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 truncate max-w-32">
                                {item.mealSnapshot?.name || 'Unknown Item'}
                              </span>
                              <span className="font-medium">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCookingSheetView = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-orange-600" />
            Cooking Sheet
          </h1>
          <p className="text-gray-600 mt-1">
            Printable cooking sheets for {selectedDate === new Date().toISOString().split('T')[0] ? 'today' : 'tomorrow'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Slot</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value || undefined)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Slots</option>
                  {Object.entries(DELIVERY_SLOT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                const productions = selectedSlot
                  ? getBranchProductions().filter(item => item.deliverySlot === selectedSlot && item.productionDate === selectedDate)
                  : getBranchProductions().filter(item => item.productionDate === selectedDate);

                if (productions.length > 0) {
                  const sheet = {
                    branchId: productions[0].branchId || '',
                    branchName: productions[0].branch?.name || '',
                    branchCode: productions[0].branch?.name?.split(' ')[0] || '',
                    date: selectedDate,
                    deliverySlot: selectedSlot || null,
                    generatedAt: new Date().toISOString(),
                    items: productions.map(item => ({
                      subscriptionId: item.subscriptionId,
                      customerName: item.subscription?.customer?.fullName || '',
                      customerPhone: item.subscription?.customer?.phone || '',
                      deliverySlot: item.deliverySlot,
                      address: null,
                      items: item.items?.map(it => ({
                        productionItemId: it.id,
                        foodItemId: it.mealSnapshot?.foodItemId || '',
                        foodItemName: it.mealSnapshot?.name || '',
                        isVeg: it.mealSnapshot?.isVeg || false,
                        categoryName: '',
                        quantity: it.quantity,
                        basePrice: it.mealSnapshot?.basePrice || 0,
                        gstRate: it.mealSnapshot?.gstRate || 0,
                        status: it.status,
                      })) || [],
                    })) || [],
                    totals: {
                      totalItems: productions.reduce((sum, item) => sum + (item.items?.length || 0), 0),
                      totalQuantity: productions.reduce((sum, item) => sum + (item.items?.reduce((itSum, it) => itSum + it.quantity, 0) || 0), 0),
                      byFoodItem: []
                    },
                  };

                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return;

                  const html = `\n                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Branch Cooking Sheet - ${new Date(selectedDate).toLocaleDateString('en-IN')}</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
                          .title { font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 8px; }
                          .subtitle { font-size: 16px; color: #6b7280; }
                          .section { margin-bottom: 30px; }
                          .section-title { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px; }
                          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; }
                          .card-title { font-size: 16px; font-weight: bold; color: #374151; margin-bottom: 10px; }
                          .customer-card { background-color: #f9fafb; }
                          .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                          .item-row:last-child { border-bottom: none; }
                          .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
                          .status-pending { background-color: #fef3c7; color: #92400e; }
                          .status-in-progress { background-color: #dbeafe; color: #1e40af; }
                          .status-completed { background-color: #dcfce7; color: #166534; }
                          .status-cancelled { background-color: #fee2e2; color: #991b1b; }
                          .status-skipped { background-color: #f3f4f6; color: #374151; }
                          .totals { background-color: #f3f4f6; padding: 20px; border-radius: 8px; }
                          .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                          .total-row:last-child { font-weight: bold; font-size: 18px; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1 class="title">🍽️ Branch Cooking Sheet</h1>
                          <p class="subtitle">Branch: ${productions[0].branch?.name || 'N/A'}</p>
                          <p class="subtitle">Date: ${new Date(selectedDate).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}</p>
                          ${selectedSlot ? `<p class="subtitle">Delivery Slot: ${DELIVERY_SLOT_LABELS[selectedSlot as keyof typeof DELIVERY_SLOT_LABELS] || selectedSlot}</p>` : ''}
                          <p class="subtitle">Generated: ${new Date().toLocaleString('en-IN')}</p>
                        </div>

                        <div class="section">
                          <h2 class="section-title">📊 Kitchen Summary</h2>
                          <div class="grid">
                            <div class="card">
                              <h3 class="card-title">📦 Total Items</h3>
                              <p style="font-size: 24px; font-weight: bold; color: #3b82f6;">${sheet.totals.totalItems}</p>
                            </div>
                            <div class="card">
                              <h3 class="card-title">📏 Total Quantity</h3>
                              <p style="font-size: 24px; font-weight: bold; color: #10b981;">${sheet.totals.totalQuantity}</p>
                            </div>
                            <div class="card">
                              <h3 class="card-title">🥘 Active Subscriptions</h3>
                              <p style="font-size: 24px; font-weight: bold; color: #6366f1;">${sheet.items.length}</p>
                            </div>
                          </div>
                        </div>

                        <div class="section">
                          <h2 class="section-title">👥 Customer Details</h2>
                          ${sheet.items.map((customer) => `\n                            <div class="card customer-card">\n                              <h3 class="card-title">👤 ${customer.customerName}</h3>\n                              <div class=\"space-y-2\">\n                                <div class=\"item-row\">\n                                  <span>📞 Phone:</span>\n                                  <span><strong>${customer.customerPhone}</strong></span>\n                                </div>\n                                <div class=\"item-row\">\n                                  <span>📍 Address:</span>\n                                  <span><strong>${customer.address || 'Not provided'}</strong></span>\n                                </div>\n                              </div>\n                              <div class=\"mt-3\">\n                                <h4 class=\"card-title\" style=\"font-size: 14px;\">🥘 Food Items</h4>\n                                ${customer.items.map((foodItem) => `\n                                  <div class=\"item-row\" style=\"padding: 6px 0;\">\n                                    <span>🍽️ ${foodItem.foodItemName} (🔼: ${foodItem.isVeg ? '✅' : '❌'})</span>\n                                    <span><strong>Qty: ${foodItem.quantity}</strong> | <strong>Status: ${foodItem.status}</strong></span>\n                                  </div>\n                                `).join('')}\n                              </div>\n                            </div>\n                          `).join('')}
                        </div>

                        <div class="totals">\n                          <h3 class=\"card-title\" style=\"color: white;\">📊 Total Summary</h3>\n                          <div class=\"total-row\">\n                            <span>Total Production Items:</span>\n                            <span>${sheet.totals.totalItems}</span>\n                          </div>\n                          <div class=\"total-row\">\n                            <span>Total Quantity to Prepare:</span>\n                            <span>${sheet.totals.totalQuantity}</span>\n                          </div>\n                          <div class=\"total-row\">\n                            <span>Active Orders:</span>\n                            <span>${sheet.items.length}</span>\n                          </div>\n                        </div>\n\n                        <script>\n                          window.print();\n                        </script>\n                      </body>\n                    </html>\n                  `;

                  printWindow.document.write(html);
                  printWindow.document.close();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Generate Cooking Sheet
            </button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: Clock, count: getTodayProductions().length },
    { id: 'tomorrow', label: 'Tomorrow', icon: Calendar, count: getTomorrowProductions().length },
    { id: 'upcoming', label: 'Upcoming', icon: BarChart3, count: getUpcomingProductions().length },
    { id: 'cooking-sheet', label: 'Cooking Sheet', icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Branch Production"
        subtitle="Branch Manager — View and manage production for your branch"
        actions={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${activeTab === tab.id
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'today' && renderTodayView()}
        {activeTab === 'tomorrow' && renderTomorrowView()}
        {activeTab === 'upcoming' && renderUpcomingView()}
        {activeTab === 'cooking-sheet' && renderCookingSheetView()}
      </div>
    </div>
  );
}