import type { SubscriptionProductionItem } from '@/lib/api/subscription-production.api';
import { ProductionStatusBadge, StatusSelect } from '@/features/subscription-production/components/ProductionStatusBadge';
import type { SubscriptionProductionStatus } from '@/features/subscription-production/types/subscription-production';
import { Store, User, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ProductionTableProps {
  items: SubscriptionProductionItem[];
  loading: boolean;
  onStatusChange?: (item: SubscriptionProductionItem, newStatus: SubscriptionProductionStatus, reason?: string) => void;
  showBranch?: boolean;
  showDeliverySlot?: boolean;
  showSubscription?: boolean;
}

export function ProductionTable({ items, loading, onStatusChange, showBranch, showDeliverySlot, showSubscription }: ProductionTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Store className="h-12 w-12 mb-3" />
        <p className="text-sm">No production records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50/50">
          <tr>
            {showBranch && (
              <th className="px-4 py-3 font-medium text-gray-600">Branch</th>
            )}
            {showSubscription && (
              <th className="px-4 py-3 font-medium text-gray-600">Customer</th>
            )}
            <th className="px-4 py-3 font-medium text-gray-600">Plan</th>
            <th className="px-4 py-3 font-medium text-gray-600">Date</th>
            {showDeliverySlot && (
              <th className="px-4 py-3 font-medium text-gray-600">Slot</th>
            )}
            <th className="px-4 py-3 font-medium text-gray-600">Items</th>
            <th className="px-4 py-3 font-medium text-gray-600">Qty</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            {onStatusChange && (
              <th className="px-4 py-3 font-medium text-gray-600">Action</th>
            )}
            <th className="px-4 py-3 font-medium text-gray-600">Generated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
              {showBranch && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{item.branch?.name ?? '—'}</span>
                  </div>
                </td>
              )}
              {showSubscription && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{item.subscription?.customer?.fullName ?? '—'}</span>
                    <span className="text-xs text-gray-500">({item.subscription?.customer?.phone ?? '—'})</span>
                  </div>
                </td>
              )}
              <td className="px-4 py-3 text-gray-700 max-w-[150px] truncate">
                {item.subscription?.planName ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {new Date(item.productionDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              {showDeliverySlot && (
                <td className="px-4 py-3 text-gray-700">{item.deliverySlot}</td>
              )}
              <td className="px-4 py-3 text-gray-700">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="font-medium">{item.items?.length ?? 0}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">{item.items?.reduce((acc, it) => acc + it.quantity, 0) ?? 0}</td>
              <td className="px-4 py-3">
                <ProductionStatusBadge status={item.status as SubscriptionProductionStatus} />
              </td>
              {onStatusChange && (
                <td className="px-4 py-3">
                  <StatusSelect
                    value={item.status as SubscriptionProductionStatus}
                    onChange={(newStatus) => onStatusChange(item, newStatus)}
                  />
                </td>
              )}
              <td className="px-4 py-3 text-xs text-gray-400">
                {new Date(item.generatedAt || item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ExpandedProductionRow({
  production,
  expanded,
  onToggle,
  onStatusChange,
}: {
  production: SubscriptionProductionItem;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (item: SubscriptionProductionItem, newStatus: SubscriptionProductionStatus, reason?: string) => void;
}) {
  return (
    <>
      <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={onToggle}>
        <td colSpan={9} className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              <span className="font-medium text-gray-900">{production.subscription?.customer?.fullName}</span>
              <span className="text-xs text-gray-500">
                {new Date(production.productionDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <span className="text-xs text-gray-500">({production.subscription?.customer?.phone})</span>
              <ProductionStatusBadge status={production.status as SubscriptionProductionStatus} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">
                {production.items?.reduce((acc, it) => acc + it.quantity, 0) ?? 0} items
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                {expanded ? 'Hide Details' : 'View Details'}
              </button>
            </div>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/50">
          <td colSpan={9} className="px-4 py-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Production Items</div>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {production.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-white p-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <div className="font-medium text-gray-900">{item.mealSnapshot?.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.mealSnapshot?.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    <ProductionStatusBadge status={item.status as SubscriptionProductionStatus} />
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}