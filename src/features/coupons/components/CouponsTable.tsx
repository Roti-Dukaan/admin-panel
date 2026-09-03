"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coupon, formatCouponValue } from "../types/coupon";
import { Switch } from "@/components/ui/switch";

interface CouponsTableProps {
  coupons: Coupon[];
  branchNameById: Record<string, string>;
  onEdit: (coupon: Coupon) => void;
  onToggleActive: (coupon: Coupon) => void;
}

export function CouponsTable({
  coupons,
  branchNameById,
  onEdit,
  onToggleActive,
}: CouponsTableProps) {
  if (coupons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        No coupons found. Create one to offer realtime order discounts.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Used</th>
            <th className="px-4 py-3">Valid Until</th>
            <th className="px-4 py-3">Branches</th>
            <th className="px-4 py-3">First Order</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {coupons.map((coupon) => {
            const branchIds = coupon.applicableBranchIds ?? [];
            const branchLabel =
              branchIds.length === 0
                ? "All branches"
                : branchIds.map((id) => branchNameById[id] ?? id.slice(0, 8)).join(", ");

            return (
              <tr key={coupon.id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3">
                  <div className="font-bold text-gray-900">{coupon.code}</div>
                  <div className="text-xs text-gray-500">{coupon.title}</div>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const expired = new Date(coupon.validTill).getTime() < Date.now();
                    if (!coupon.active) {
                      return <Badge variant="secondary">Inactive</Badge>;
                    }
                    if (expired) {
                      return <Badge variant="secondary">Expired</Badge>;
                    }
                    return <Badge variant="default">Active</Badge>;
                  })()}
                </td>
                <td className="px-4 py-3">{coupon.discountType}</td>
                <td className="px-4 py-3 font-semibold">{formatCouponValue(coupon)}</td>
                <td className="px-4 py-3">
                  {coupon.usageCount}
                  {coupon.totalUsageLimit != null ? ` / ${coupon.totalUsageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  {new Date(coupon.validTill).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 max-w-[180px] truncate" title={branchLabel}>
                  {branchLabel}
                </td>
                <td className="px-4 py-3">{coupon.firstOrderOnly ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={() => onToggleActive(coupon)}
                    />
                    <Button variant="outline" size="sm" onClick={() => onEdit(coupon)}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
