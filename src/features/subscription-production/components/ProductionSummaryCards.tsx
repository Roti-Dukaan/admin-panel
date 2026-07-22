import type { DaySummary, CookingSheet } from '@/lib/api/subscription-production.api';
import { Store, UtensilsCrossed, Clock, AlertTriangle, CheckCircle, XCircle, Loader2, SkipForward, MinusCircle } from 'lucide-react';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50', icon: Loader2 },
  COMPLETED: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
  SKIPPED: { label: 'Skipped', color: 'text-gray-600', bg: 'bg-gray-50', icon: SkipForward },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

export function ProductionSummaryCards({ summary }: { summary: DaySummary | null }) {
  if (!summary) return null;

  const total = summary.totalProductions;
  const byStatus = summary.byStatus || {};

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Total Productions</p>
        <p className="text-2xl font-bold text-gray-900">{total}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Total Items</p>
        <p className="text-2xl font-bold text-gray-900">{summary.totalItems}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Total Quantity</p>
        <p className="text-2xl font-bold text-gray-900">{summary.totalQuantity}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Pending</p>
        <p className="text-2xl font-bold text-blue-600">{byStatus.PENDING || 0}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Completed</p>
        <p className="text-2xl font-bold text-emerald-600">{byStatus.COMPLETED || 0}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">In Progress</p>
        <p className="text-2xl font-bold text-amber-600">{byStatus.IN_PROGRESS || 0}</p>
      </div>
    </div>
  );
}

export function ProductionStatusCard({ status, count, onClick }: { status: string; count: number; onClick?: () => void }) {
  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'text-gray-600', bg: 'bg-gray-50', icon: MinusCircle };
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border border-gray-100 bg-white p-4 text-left transition-colors ${onClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className="text-xs font-medium text-gray-500">{config.label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
    </button>
  );
}

export function BranchProductionCard({
  branch,
  onClick,
}: {
  branch: DaySummary['branches'][0];
  onClick?: () => void;
}) {
  const byStatus = branch.byStatus || {};
  const bySlot = branch.bySlot || {};

  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{branch.branchName}</h3>
          <p className="text-xs text-gray-500">{branch.branchCode}</p>
        </div>
        {branch.totalProductions > 0 && (
          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            <AlertTriangle className="h-3 w-3" />
            {branch.totalProductions} productions
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="rounded-lg bg-emerald-50 p-2 text-center">
          <p className="text-lg font-bold text-emerald-600">{byStatus.COMPLETED || 0}</p>
          <p className="text-emerald-600">Completed</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-2 text-center">
          <p className="text-lg font-bold text-amber-600">{byStatus.IN_PROGRESS || 0}</p>
          <p className="text-amber-600">In Progress</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2 text-center">
          <p className="text-lg font-bold text-blue-600">{byStatus.PENDING || 0}</p>
          <p className="text-blue-600">Pending</p>
        </div>
        <div className="rounded-lg bg-red-50 p-2 text-center">
          <p className="text-lg font-bold text-red-600">{(byStatus.CANCELLED || 0) + (byStatus.SKIPPED || 0)}</p>
          <p className="text-red-600">Issues</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        {Object.entries(bySlot).map(([slot, count]) => (
          <span key={slot} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            {slot}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CookingSheetSummaryCards({ sheet }: { sheet: CookingSheet | null }) {
  if (!sheet) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Total Items</p>
        <p className="text-2xl font-bold text-gray-900">{sheet.totals.totalItems}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Total Quantity</p>
        <p className="text-2xl font-bold text-gray-900">{sheet.totals.totalQuantity}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Unique Food Items</p>
        <p className="text-2xl font-bold text-blue-600">{sheet.totals.byFoodItem.length}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs text-gray-500">Subscriptions</p>
        <p className="text-2xl font-bold text-emerald-600">{sheet.items.length}</p>
      </div>
    </div>
  );
}