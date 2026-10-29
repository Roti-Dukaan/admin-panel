"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Copy, Trash2, Star, ToggleLeft, ToggleRight, ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import { useMenuStore } from "../hooks/useMenu";
import { FoodItem, CUSTOMER_LABEL_CONFIG, CustomerLabel } from "../types/menu";
import { CategoryBadge, AvailabilityBadge } from "./CategoryBadge";

const columnHelper = createColumnHelper<FoodItem>();

export function MenuTable() {
  const getFilteredFoods = useMenuStore((s) => s.getFilteredFoods);
  const foods = useMenuStore((s) => s.foods);
  const filters = useMenuStore((s) => s.filters);
  const filteredFoods = useMemo(() => getFilteredFoods(), [getFilteredFoods, foods, filters]);
  const openViewDrawer = useMenuStore((s) => s.openViewDrawer);
  const openEditDrawer = useMenuStore((s) => s.openEditDrawer);
  const openDeleteModal = useMenuStore((s) => s.openDeleteModal);
  const duplicateFood = useMenuStore((s) => s.duplicateFood);
  const toggleFeatured = useMenuStore((s) => s.toggleFeatured);
  const toggleAvailability = useMenuStore((s) => s.toggleAvailability);
  const moveFood = useMenuStore((s) => s.moveFood);

  const displayOrderFoods = useMemo(
    () => [...foods].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt),
    [foods],
  );
  const displayOrderIndexById = useMemo(
    () => new Map(displayOrderFoods.map((food, index) => [food.id, index])),
    [displayOrderFoods],
  );

  const [sorting, setSorting] = useState<SortingState>([{ id: "sortOrder", desc: false }]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const columns = useMemo(() => [
    columnHelper.display({
      id: "order",
      header: "Order",
      cell: (info) => {
        const displayIndex = displayOrderIndexById.get(info.row.original.id);
        if (displayIndex === undefined) return null;
        const isFirst = displayIndex === 0;
        const isLast = displayIndex === displayOrderFoods.length - 1;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => moveFood(info.row.original.id, "up")}
              disabled={isFirst}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono text-gray-500">{info.row.original.sortOrder}</span>
            <button
              type="button"
              onClick={() => moveFood(info.row.original.id, "down")}
              disabled={isLast}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        );
      },
      size: 56,
    }),
    columnHelper.accessor("sortOrder", {
      header: "Display Order",
      enableHiding: true,
    }),
    columnHelper.display({
      id: "image",
      header: "",
      cell: (info) => {
        const url = info.row.original.imageUrl;
        return url ? (
          <img
            src={url}
            alt={info.row.original.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <ImageIcon className="h-5 w-5 text-gray-400" />
          </div>
        );
      },
      size: 60,
    }),
    columnHelper.accessor("name", {
      header: "Food Name",
      cell: (info) => (
        <div>
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{info.getValue()}</p>
          <p className="text-xs text-gray-500 truncate max-w-[180px]">{info.row.original.shortDescription}</p>
        </div>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => <CategoryBadge category={info.getValue()} />,
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cell: (info) => {
        const variantCount = info.row.original.variants?.filter((variant) => variant.name.trim()).length ?? 0;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-gray-900">
              ₹{typeof info.getValue() === 'number' && info.getValue() > 99999
                ? (info.getValue() / 100000).toFixed(1) + 'L'
                : info.getValue()}
            </span>
            {variantCount > 0 && (
              <span className="text-[11px] text-gray-500">{variantCount} variants</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("preparationTime", {
      header: "Prep Time",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue()} min</span>,
    }),
    columnHelper.accessor("availability", {
      header: "Status",
      cell: (info) => <AvailabilityBadge availability={info.getValue()} />,
    }),
    columnHelper.accessor("isFeatured", {
      header: "Featured",
      cell: (info) => (
        <button onClick={() => toggleFeatured(info.row.original.id)} className="hover:opacity-70">
          {info.getValue() ? (
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          ) : (
            <Star className="h-4 w-4 text-gray-300" />
          )}
        </button>
      ),
    }),
    columnHelper.display({
      id: "labels",
      header: "Labels",
      cell: (info) => {
        const labels = info.row.original.customerLabels;
        return (
          <div className="flex flex-wrap gap-1">
            {labels.slice(0, 2).map((label) => {
              const cfg = CUSTOMER_LABEL_CONFIG[label];
              return cfg ? (
                <span key={label} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bgColor} ${cfg.color}`}>
                  {cfg.label}
                </span>
              ) : null;
            })}
            {labels.length > 2 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                +{labels.length - 2}
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated",
      cell: (info) => (
        <span className="text-xs text-gray-500">
          {new Date(info.getValue()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const food = info.row.original;
        return (
          <RowActions
            food={food}
            isOpen={openMenu === food.id}
            onToggle={() => setOpenMenu(openMenu === food.id ? null : food.id)}
            onClose={() => setOpenMenu(null)}
            onView={() => { openViewDrawer(food); setOpenMenu(null); }}
            onEdit={() => { openEditDrawer(food); setOpenMenu(null); }}
            onDuplicate={() => { duplicateFood(food); setOpenMenu(null); }}
            onToggleAvailability={() => { toggleAvailability(food.id); setOpenMenu(null); }}
            onDelete={() => { openDeleteModal(food); setOpenMenu(null); }}
          />
        );
      },
      size: 50,
    }),
  ], [toggleFeatured, openViewDrawer, openEditDrawer, openDeleteModal, duplicateFood, toggleAvailability, openMenu, moveFood, displayOrderFoods, displayOrderIndexById]);

  const table = useReactTable({
    data: filteredFoods,
    columns,
    state: { sorting, columnVisibility: { sortOrder: false } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className="flex items-center gap-1 hover:text-gray-700"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3" />}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredFoods.length === 0 && (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-gray-400">No food items found</p>
        </div>
      )}
    </div>
  );
}

function RowActions({
  food,
  isOpen,
  onToggle,
  onClose,
  onView,
  onEdit,
  onDuplicate,
  onToggleAvailability,
  onDelete,
}: {
  food: FoodItem;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleAvailability: () => void;
  onDelete: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuHeight = 280;
      const menuWidth = 176;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const showBelow = spaceBelow > menuHeight;
      const showRight = window.innerWidth - rect.right > menuWidth;
      setCoords({
        top: showBelow ? rect.bottom + 4 : Math.max(8, rect.top - menuHeight),
        right: showRight ? window.innerWidth - rect.right : Math.max(8, window.innerWidth - rect.left - menuWidth),
      });
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={onToggle}
        className="rounded-lg p-1.5 hover:bg-gray-100"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>
      {isOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed z-50 w-44 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg"
              style={{ top: coords.top, right: coords.right }}
            >
<MenuItem icon={Eye} label="View" onClick={onView} />
               <MenuItem icon={Edit} label="Edit" onClick={onEdit} />
               <MenuItem icon={Copy} label="Duplicate" onClick={onDuplicate} />
               <MenuItem
                 icon={food.availability === "available" ? ToggleRight : ToggleLeft}
                 label={food.availability === "available" ? "Unpublish" : "Publish"}
                 onClick={onToggleAvailability}
               />
               <div className="my-1 border-t border-gray-100" />
               <MenuItem icon={Trash2} label="Delete" onClick={onDelete} danger />
            </motion.div>
          </>,
          document.body
        )}
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors ${
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
