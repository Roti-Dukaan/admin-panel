"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  Copy,
  Archive,
  Trash2,
  MoreHorizontal,
  Shield,
  Crown,
  Users,
  UserCog,
  ChefHat,
  Truck,
  Headphones,
  DollarSign,
  Eye as EyeIcon,
  Star,
  Key,
  Lock,
  Globe,
  Settings,
  Bookmark,
} from "lucide-react";
import { useRoleStore } from "../hooks/useRoles";
import { TableActionsMenu } from "@/components/ui/table-actions-menu";
import { Role } from "../types/role";

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Crown,
  Users,
  UserCog,
  ChefHat,
  Truck,
  Headphones,
  DollarSign,
  Eye: EyeIcon,
  Star,
  Key,
  Lock,
  Globe,
  Settings,
  Bookmark,
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  if (status === "active")
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
      Inactive
    </span>
  );
}

function getTypeBadge(isSystem: boolean) {
  if (isSystem)
    return (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
        System
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
      Custom
    </span>
  );
}

export function RolesTable() {
  const router = useRouter();
  const getFilteredRoles = useRoleStore((s) => s.getFilteredRoles);
  const setCloneSourceRole = useRoleStore((s) => s.setCloneSourceRole);
  const setCloneDialogOpen = useRoleStore((s) => s.setCloneDialogOpen);
  const setRoleToDelete = useRoleStore((s) => s.setRoleToDelete);
  const setDeleteModalOpen = useRoleStore((s) => s.setDeleteModalOpen);
  const archiveRole = useRoleStore((s) => s.archiveRole);
  const users = useRoleStore((s) => s.users);
  const roles = useMemo(() => getFilteredRoles(), [getFilteredRoles]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Role
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const role = row.original;
          const Icon = iconMap[role.icon] || Shield;
          return (
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${role.color}15` }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: role.color }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {role.name}
                  </p>
                  {getTypeBadge(role.isSystem)}
                </div>
                <p className="text-xs text-gray-500 truncate max-w-[240px]">
                  {role.description}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "users",
        header: () => (
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Users
          </span>
        ),
        cell: ({ row }) => {
          const count = users.filter(
            (u) => u.roleId === row.original.id
          ).length;
          return (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {count}
              </span>
            </div>
          );
        },
      },
      {
        id: "permissions",
        header: () => (
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Permissions
          </span>
        ),
        cell: ({ row }) => {
          const totalPerms = row.original.permissions.reduce(
            (sum, p) => sum + p.actions.length,
            0
          );
          return (
            <span className="text-sm text-gray-600">
              {totalPerms} permissions
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Created
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600">
            {formatDate(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: () => (
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Status
          </span>
        ),
        cell: ({ getValue }) => getStatusBadge(getValue() as string),
      },
      {
        id: "actions",
        header: () => (
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Actions
          </span>
        ),
        cell: ({ row }) => {
          const role = row.original;
          return (
            <TableActionsMenu
              isOpen={openMenuId === role.id}
              onClose={() => setOpenMenuId(null)}
              onToggle={() => setOpenMenuId(openMenuId === role.id ? null : role.id)}
              menuWidth={192}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            >
              <button
                onClick={() => {
                  router.push(`/admin/roles/${role.id}`);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 text-gray-400" />
                View Details
              </button>
              <button
                onClick={() => {
                  router.push(`/admin/roles/${role.id}?edit=true`);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 text-gray-400" />
                Edit Role
              </button>
              {!role.isSystem && (
                <>
                  <button
                    onClick={() => {
                      setCloneSourceRole(role);
                      setCloneDialogOpen(true);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                    Clone Role
                  </button>
                  <button
                    onClick={() => {
                      archiveRole(role.id);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => {
                      setRoleToDelete(role);
                      setDeleteModalOpen(true);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </>
              )}
              {role.isSystem && (
                <button
                  onClick={() => {
                    setCloneSourceRole(role);
                    setCloneDialogOpen(true);
                    setOpenMenuId(null);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 text-gray-400" />
                  Clone Role
                </button>
              )}
            </TableActionsMenu>
          );
        },
      },
    ],
    [
      users,
      openMenuId,
      router,
      archiveRole,
      setCloneSourceRole,
      setCloneDialogOpen,
      setRoleToDelete,
      setDeleteModalOpen,
    ]
  );

  const table = useReactTable({
    data: roles,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-100 bg-gray-50/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Shield className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        No roles found
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/roles/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {roles.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/30 px-4 py-2.5">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {roles.length}
            </span>{" "}
            role{roles.length !== 1 && "s"}
          </p>
        </div>
      )}
    </div>
  );
}
