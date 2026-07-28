"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coupon, CouponDiscountType, CreateCouponInput } from "../types/coupon";

interface BranchOption {
  id: string;
  name: string;
}

interface CouponEditorProps {
  open: boolean;
  mode: "create" | "edit";
  coupon: Coupon | null;
  branches: BranchOption[];
  onClose: () => void;
  onSave: (input: CreateCouponInput) => Promise<void>;
}

function toLocalInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CouponEditor({
  open,
  mode,
  coupon,
  branches,
  onClose,
  onSave,
}: CouponEditorProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateCouponInput>({
    code: "",
    title: "",
    description: "",
    discountType: "FLAT",
    discountValue: 10,
    minOrderValue: 0,
    validFrom: new Date().toISOString(),
    validTill: new Date(Date.now() + 30 * 86400000).toISOString(),
    active: true,
    applicableBranchIds: [],
    firstOrderOnly: false,
    autoApply: false,
  });

  useEffect(() => {
    if (!open) return;
    if (coupon && mode === "edit") {
      setForm({
        code: coupon.code,
        title: coupon.title,
        description: coupon.description ?? "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscountAmount: coupon.maxDiscountAmount ?? undefined,
        totalUsageLimit: coupon.totalUsageLimit ?? undefined,
        perUserUsageLimit: coupon.perUserUsageLimit ?? undefined,
        validFrom: coupon.validFrom,
        validTill: coupon.validTill,
        active: coupon.active,
        applicableBranchIds: coupon.applicableBranchIds ?? [],
        firstOrderOnly: coupon.firstOrderOnly,
        autoApply: coupon.autoApply,
      });
    } else {
      setForm({
        code: "",
        title: "",
        description: "",
        discountType: "FLAT",
        discountValue: 10,
        minOrderValue: 0,
        validFrom: new Date().toISOString(),
        validTill: new Date(Date.now() + 30 * 86400000).toISOString(),
        active: true,
        applicableBranchIds: [],
        firstOrderOnly: false,
        autoApply: false,
      });
    }
  }, [open, coupon, mode]);

  if (!open) return null;

  const toggleBranch = (branchId: string) => {
    setForm((prev) => {
      const current = prev.applicableBranchIds ?? [];
      const next = current.includes(branchId)
        ? current.filter((id) => id !== branchId)
        : [...current, branchId];
      return { ...prev, applicableBranchIds: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        applicableBranchIds:
          (form.applicableBranchIds?.length ?? 0) > 0 ? form.applicableBranchIds : undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              {mode === "create" ? "Create Coupon" : "Edit Coupon"}
            </h2>
            <p className="text-sm text-gray-500">Realtime orders only</p>
          </div>

          <div className="flex-1 space-y-4 px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) =>
                    setForm({ ...form, discountType: v as CouponDiscountType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat (₹)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({ ...form, discountValue: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minOrderValue">Min Order (₹)</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  min={0}
                  value={form.minOrderValue ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, minOrderValue: Number(e.target.value) })
                  }
                />
              </div>
              {form.discountType === "PERCENTAGE" && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">Max Discount (₹)</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    min={0}
                    value={form.maxDiscountAmount ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="totalUsageLimit">Total Usage Limit</Label>
                <Input
                  id="totalUsageLimit"
                  type="number"
                  min={1}
                  value={form.totalUsageLimit ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      totalUsageLimit: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perUserUsageLimit">Per User Limit</Label>
                <Input
                  id="perUserUsageLimit"
                  type="number"
                  min={1}
                  value={form.perUserUsageLimit ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      perUserUsageLimit: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={toLocalInputValue(form.validFrom)}
                  onChange={(e) =>
                    setForm({ ...form, validFrom: new Date(e.target.value).toISOString() })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTill">Valid Until</Label>
                <Input
                  id="validTill"
                  type="datetime-local"
                  value={toLocalInputValue(form.validTill)}
                  onChange={(e) =>
                    setForm({ ...form, validTill: new Date(e.target.value).toISOString() })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Applicable Branches (empty = all)</Label>
              <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                {branches.map((branch) => (
                  <label key={branch.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(form.applicableBranchIds ?? []).includes(branch.id)}
                      onChange={() => toggleBranch(branch.id)}
                    />
                    {branch.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.active ?? true}
                  onCheckedChange={(active) => setForm({ ...form, active })}
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.firstOrderOnly ?? false}
                  onCheckedChange={(firstOrderOnly) => setForm({ ...form, firstOrderOnly })}
                />
                First order only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.autoApply ?? false}
                  onCheckedChange={(autoApply) => setForm({ ...form, autoApply })}
                />
                Auto apply
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
