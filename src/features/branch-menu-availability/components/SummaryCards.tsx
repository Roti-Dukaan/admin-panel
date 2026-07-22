import { cn } from '@/lib/utils';
import type { BranchMenuSummary } from '@/lib/api/branch-menu-availability.api';
import { Store, UtensilsCrossed, ShoppingCart, Ban } from 'lucide-react';

const summaryCardConfig = [
  { key: 'totalItems', label: 'Total Items', icon: UtensilsCrossed, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'available', label: 'Available', icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'outOfStock', label: 'Out of Stock', icon: ShoppingCart, color: 'text-red-600', bg: 'bg-red-50' },
  { key: 'disabled', label: 'Disabled', icon: Ban, color: 'text-gray-600', bg: 'bg-gray-50' },
] as const;

export function SummaryCards({ summary }: { summary: BranchMenuSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {summaryCardConfig.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key as keyof typeof summary] as number;
        return (
          <div key={card.key} className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className={cn('rounded-lg p-2', card.bg)}>
                <Icon className={cn('h-5 w-5', card.color)} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}

