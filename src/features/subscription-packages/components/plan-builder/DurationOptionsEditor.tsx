"use client";

import { Plus, Trash2 } from "lucide-react";
import type { DurationOptionConfig } from "../../types/plan-builder";
import { createId } from "../../types/plan-builder";

interface DurationOptionsEditorProps {
  options: DurationOptionConfig[];
  disabled?: boolean;
  errors: Record<string, string>;
  onChange: (options: DurationOptionConfig[]) => void;
}

const QUICK_ADD_DAYS = [7, 15, 30];

function emptyOption(days = 7): DurationOptionConfig {
  return {
    id: createId(),
    days,
    label: `${days} Days`,
    enabled: true,
    isDefault: false,
  };
}

export function DurationOptionsEditor({
  options,
  disabled,
  errors,
  onChange,
}: DurationOptionsEditorProps) {
  const rows = options.length ? options : [emptyOption(30)];

  const updateRow = (id: string, patch: Partial<DurationOptionConfig>) => {
    onChange(
      rows.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        if (patch.days != null) {
          const days = Math.max(1, Math.round(Number(patch.days) || 1));
          next.days = days;
          if (!patch.label) {
            next.label = `${days} Days`;
          }
        }
        return next;
      }),
    );
  };

  const setDefault = (id: string) => {
    onChange(
      rows.map((row) => ({
        ...row,
        isDefault: row.id === id,
        enabled: row.id === id ? true : row.enabled,
      })),
    );
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    const next = rows.filter((row) => row.id !== id);
    if (!next.some((row) => row.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    onChange(next);
  };

  const addRow = (days?: number) => {
    const usedDays = new Set(rows.map((row) => row.days));
    let nextDays = days ?? 7;
    while (usedDays.has(nextDays)) nextDays += 1;
    onChange([...rows, emptyOption(nextDays)]);
  };

  const quickAddDays = QUICK_ADD_DAYS.filter(
    (days) => !rows.some((row) => row.days === days),
  );

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-700">Duration options</p>
        <p className="mt-1 text-xs text-gray-500">
          How many deliveries the customer can choose (e.g. 7, 15, 30). Pricing comes from meal
          options below — total = per-meal price × selected duration.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Deliveries</th>
              <th className="px-3 py-2.5 font-semibold">Label</th>
              <th className="px-3 py-2.5 font-semibold">Default</th>
              <th className="px-3 py-2.5 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-3 py-3">
                  <input
                    disabled={disabled}
                    type="number"
                    min={1}
                    step={1}
                    value={row.days}
                    onChange={(e) => updateRow(row.id, { days: Number(e.target.value) })}
                    className="w-full max-w-[88px] rounded-lg border border-gray-200 px-2.5 py-1.5"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    disabled={disabled}
                    value={row.label}
                    onChange={(e) => updateRow(row.id, { label: e.target.value })}
                    className="w-full min-w-[120px] rounded-lg border border-gray-200 px-2.5 py-1.5"
                    placeholder={`${row.days} Days`}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    disabled={disabled}
                    type="radio"
                    name="defaultDuration"
                    checked={row.isDefault === true}
                    onChange={() => setDefault(row.id)}
                    className="h-4 w-4 border-gray-300"
                  />
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    type="button"
                    disabled={disabled || rows.length <= 1}
                    onClick={() => removeRow(row.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    title="Remove option"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => addRow()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add duration option
          </button>
          {quickAddDays.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => addRow(days)}
              className="rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
            >
              + {days} days
            </button>
          ))}
        </div>
      )}

      {errors.durationOptions && (
        <p className="text-xs text-red-600">{errors.durationOptions}</p>
      )}
    </div>
  );
}
