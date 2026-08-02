"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useAdminProduction, useAdminToday, useAdminTomorrow, useAdminSummary, useAdminUpdateStatus, useAdminGenerate } from "@/features/subscription-production/hooks/useSubscriptionProduction";
import { ProductionSummaryCards } from "@/features/subscription-production/components/ProductionSummaryCards";
import { ProductionTable } from "@/features/subscription-production/components/ProductionTable";
import { ProductionCookingSheet } from "@/features/subscription-production/components/ProductionCookingSheet";
import { subscriptionProductionApi, type ProductionQueryParams } from "@/lib/api/subscription-production.api";
import { Search, Filter, Calendar, ChevronDown, ChevronUp, Download, AlertTriangle, Clock, CheckCircle, XCircle, Loader2, SkipForward, Plus, TrendingUp, BarChart3, Users, Package } from "lucide-react";
import { DELIVERY_SLOT_LABELS } from "@/features/subscription-production/types/subscription-production";
import { todayDateKey } from "@/lib/date";

interface AdminSubscriptionProductionPageProps {
  initialTab?: 'today' | 'tomorrow' | 'summary' | 'list' | 'generate';
}

export default function AdminSubscriptionProductionPage({ initialTab = 'today' }: AdminSubscriptionProductionPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDate, setSelectedDate] = useState(todayDateKey());
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const { items, loading, filters, setFilters, refresh } = useAdminProduction();
  const { summary: todaySummary, loading: todayLoading } = useAdminToday();
  const { summary: tomorrowSummary, loading: tomorrowLoading } = useAdminTomorrow();
  const { summary: summary, loading: summaryLoading, refresh: refreshSummary } = useAdminSummary(selectedDate);
  const { update: updateStatus, updating } = useAdminUpdateStatus();
  const { generate, generating } = useAdminGenerate();

  const handleStatusChange = async (item: any, newStatus: string) => {
    await updateStatus(item.id, { status: newStatus as any });
    refresh();
    if (activeTab === 'today' || activeTab === 'tomorrow') {
      refreshSummary();
    }
  };

  const handleGenerate = async () => {
    await generate(selectedDate);
    refresh();
    refreshSummary();
  };

  const handleFiltersChange = (key: keyof ProductionQueryParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'SKIPPED': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-orange-600" />
                  Today's Production
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {generating ? 'Generating...' : 'Generate Now'}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Slot</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Slots</option>
                      {Object.entries(DELIVERY_SLOT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="SKIPPED">Skipped</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="md:col-span-2" />
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedSlot(undefined);
                        setSelectedStatus(undefined);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {todayLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : todaySummary ? (
              <div className="space-y-6">
                <ProductionSummaryCards summary={todaySummary} />

                <ProductionTable
                  items={items}
                  loading={loading}
                  showBranch
                  showDeliverySlot
                  showSubscription
                  onStatusChange={handleStatusChange}
                />
              </div>
            ) : null}
          </div>
        );

      case 'tomorrow':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-orange-600" />
                Tomorrow's Production
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

            {tomorrowLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : tomorrowSummary ? (
              <div className="space-y-6">
                <ProductionSummaryCards summary={tomorrowSummary} />

                <ProductionTable
                  items={items}
                  loading={loading}
                  showBranch
                  showDeliverySlot
                  showSubscription
                  onStatusChange={handleStatusChange}
                />
              </div>
            ) : null}
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-orange-600" />
                Production Summary
              </h1>
              <p className="text-gray-600 mt-1">
                Select a date to view comprehensive production statistics
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {summaryLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : summary ? (
              <div className="space-y-6">
                <ProductionSummaryCards summary={summary} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {summary.branches.map((branch) => (
                    <div key={branch.branchId} className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">{branch.branchName} ({branch.branchCode})</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Productions:</span>
                          <span className="font-medium">{branch.totalProductions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Items:</span>
                          <span className="font-medium">{branch.totalItems}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium text-emerald-600">{branch.byStatus.COMPLETED || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Pending:</span>
                          <span className="font-medium text-amber-600">{branch.byStatus.PENDING || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Issues:</span>
                          <span className="font-medium text-red-600">{(branch.byStatus.CANCELLED || 0) + (branch.byStatus.SKIPPED || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-6 w-6 text-orange-600" />
                All Production Records
              </h1>
              <p className="text-gray-600 mt-1">
                Browse and manage all subscription production records
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.productionDate || ''}
                      onChange={(e) => handleFiltersChange('productionDate', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Production Date"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">All Slots</option>
                    {Object.entries(DELIVERY_SLOT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="SKIPPED">Skipped</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedSlot(undefined);
                      setSelectedStatus(undefined);
                      setFilters(prev => ({
                        ...prev,
                        productionDate: undefined,
                      }));
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <ProductionTable
              items={items}
              loading={loading}
              showBranch
              showDeliverySlot
              showSubscription
              onStatusChange={handleStatusChange}
            />
          </div>
        );

      case 'generate':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                Generate Production
              </h1>
              <p className="text-gray-600 mt-1">
                Manually trigger production generation for a specific date
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Production Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={todayDateKey()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        This will generate production records for all ACTIVE subscriptions scheduled for the selected date.
                        Existing records for that date will be skipped.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  {generating ? 'Generating Production...' : 'Generate Production Now'}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: Calendar, count: todaySummary?.totalProductions || 0 },
    { id: 'tomorrow', label: 'Tomorrow', icon: Clock, count: tomorrowSummary?.totalProductions || 0 },
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'list', label: 'All Records', icon: Package, count: items.length },
    { id: 'generate', label: 'Generate', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscription Production"
        subtitle="Super Admin — Manage daily production schedules and cooking sheets"
        actions={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
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
        {renderContent()}
      </div>
    </div>
  );
}