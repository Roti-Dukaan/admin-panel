"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bike, Loader2, Pencil, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useDeliveryBoyMutations,
  useDeliveryBoys,
} from "../hooks/useDeliveryBoys";
import type { DeliveryBoy, DeliveryBoyAvailability } from "../types/delivery-boys";
import { AVAILABILITY_LABELS } from "../types/delivery-boys";
import { normalizeEmail } from "@/lib/utils/email";

function DeliveryBoyForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: DeliveryBoy;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { create, update } = useDeliveryBoyMutations();
  const [name, setName] = React.useState(initial?.name ?? "");
  const [phone, setPhone] = React.useState(initial?.phone ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");
  const [vehicleType, setVehicleType] = React.useState(initial?.vehicleType ?? "");
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [availabilityStatus, setAvailabilityStatus] = React.useState<DeliveryBoyAvailability>(
    initial?.availabilityStatus ?? "AVAILABLE",
  );

  const isPending = create.isPending || update.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initial) {
        await update.mutateAsync({
          id: initial.id,
          name: name.trim(),
          phone: phone.trim(),
          vehicleType: vehicleType.trim() || undefined,
          notes: notes.trim() || undefined,
          availabilityStatus,
        });
        toast.success("Delivery staff updated");
      } else {
        await create.mutateAsync({
          name: name.trim(),
          phone: phone.trim(),
          email: normalizeEmail(email),
          vehicleType: vehicleType.trim() || undefined,
          notes: notes.trim() || undefined,
          availabilityStatus,
        });
        toast.success("Delivery staff added");
      }
      onSaved();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Save failed";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="db-name">Name</Label>
          <Input id="db-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="db-phone">Phone</Label>
          <Input id="db-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        {!initial && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="db-email">Email / login</Label>
            <Input
              id="db-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(normalizeEmail(e.target.value))}
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Availability</Label>
          <Select value={availabilityStatus} onValueChange={(v) => setAvailabilityStatus(v as DeliveryBoyAvailability)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="db-vehicle">Vehicle type</Label>
          <Input
            id="db-vehicle"
            placeholder="bike, scooter…"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="db-notes">Notes</Label>
          <Input id="db-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initial ? "Save changes" : "Add delivery staff"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function DeliveryBoysSection() {
  const { data: boys = [], isLoading, refetch } = useDeliveryBoys();
  const { update } = useDeliveryBoyMutations();
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<DeliveryBoy | null>(null);

  const toggleActive = async (boy: DeliveryBoy) => {
    try {
      await update.mutateAsync({ id: boy.id, active: !boy.active });
      toast.success(boy.active ? "Deactivated" : "Activated");
    } catch {
      toast.error("Could not update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Bike className="h-5 w-5 text-orange-500" />
              Subscription Delivery Staff
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage delivery partners for subscription routes only — not one-time orders.
            </p>
          </div>
          {!showForm && !editing && (
            <Button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add staff
            </Button>
          )}
        </div>

        {showForm && (
          <div className="mt-4">
            <DeliveryBoyForm
              onCancel={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                refetch();
              }}
            />
          </div>
        )}

        {editing && (
          <div className="mt-4">
            <DeliveryBoyForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSaved={() => {
                setEditing(null);
                refetch();
              }}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : boys.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">No delivery staff yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {boys.map((boy) => (
              <li key={boy.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-gray-900">{boy.name ?? "Unnamed"}</p>
                  <p className="text-sm text-gray-500">
                    {boy.phone} · {boy.email}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="outline">{AVAILABILITY_LABELS[boy.availabilityStatus]}</Badge>
                    {boy.vehicleType && <Badge variant="secondary">{boy.vehicleType}</Badge>}
                    {!boy.active && <Badge className="bg-red-100 text-red-700">Inactive</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditing(boy)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={boy.active ? "outline" : "default"}
                    onClick={() => toggleActive(boy)}
                    disabled={update.isPending}
                  >
                    {boy.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
