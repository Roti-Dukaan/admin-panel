import type { BranchMenuAvailabilityItem } from '@/lib/api/branch-menu-availability.api';
import { AvailabilityStatusBadge, StatusSelect } from './AvailabilityStatusBadge';
import type { AvailabilityStatus } from '../types/branch-menu-availability';
import { UtensilsCrossed, Store } from 'lucide-react';

interface AvailabilityTableProps {
  items: BranchMenuAvailabilityItem[];
  loading: boolean;
  showBranch?: boolean;
  excludeActionStatuses?: AvailabilityStatus[];
  onStatusChange?: (item: BranchMenuAvailabilityItem, newStatus: AvailabilityStatus, reason?: string) => void;
}

export function AvailabilityTable({ items, loading, showBranch, excludeActionStatuses, onStatusChange }: AvailabilityTableProps) {
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
        <UtensilsCrossed className="h-12 w-12 mb-3" />
        <p className="text-sm">No availability records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50/50">
          <tr>
            {showBranch && <th className="px-4 py-3 font-medium text-gray-600">Branch</th>}
            <th className="px-4 py-3 font-medium text-gray-600">Item</th>
            <th className="px-4 py-3 font-medium text-gray-600">Category</th>
            <th className="px-4 py-3 font-medium text-gray-600">Price</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            {onStatusChange && <th className="px-4 py-3 font-medium text-gray-600">Action</th>}
            <th className="px-4 py-3 font-medium text-gray-600">Reason</th>
            <th className="px-4 py-3 font-medium text-gray-600">Updated</th>
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
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.foodItem?.imageUrl ? (
                      <img src={item.foodItem.imageUrl} alt={item.foodItem.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.foodItem?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-gray-400">
                      {item.foodItem?.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">{item.foodItem?.category?.name ?? '—'}</td>
              <td className="px-4 py-3 text-gray-700">₹{Number(item.foodItem?.basePrice ?? 0).toFixed(2)}</td>
              <td className="px-4 py-3">
                <AvailabilityStatusBadge status={item.status as AvailabilityStatus} />
              </td>
              {onStatusChange && (
                <td className="px-4 py-3">
                  <StatusSelect
                    value={item.status as AvailabilityStatus}
                    excludeStatuses={excludeActionStatuses}
                    onChange={(newStatus) => onStatusChange(item, newStatus)}
                  />
                </td>
              )}
              <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px] truncate">{item.reason ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-gray-400">
                {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
