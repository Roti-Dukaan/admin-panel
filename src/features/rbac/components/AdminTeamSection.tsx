"use client";



import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import {

  Loader2,

  Mail,

  Search,

  UserCheck,

  UserPlus,

  UserX,

  Users,

  X,

  Send,

  Eye,

  Pencil,

  Trash2,

  MoreHorizontal,

} from "lucide-react";

import { InviteUserDialog } from "./InviteUserDialog";

import { ViewTeamUserDialog } from "./ViewTeamUserDialog";

import { EditTeamUserDialog } from "./EditTeamUserDialog";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import {

  adminTeamApi,

  type AdminTeamUser,

  type UpdateAdminTeamUserPayload,

} from "@/lib/api/admin-team.api";

import { cn } from "@/lib/utils";



const TEAM_QUERY_KEY = ["admin", "team"] as const;



function getInitials(name: string) {

  return name

    .split(" ")

    .map((n) => n[0])

    .join("")

    .toUpperCase()

    .slice(0, 2);

}



function formatDate(value: string | null) {

  if (!value) return "Never";

  return new Date(value).toLocaleDateString("en-IN", {

    day: "numeric",

    month: "short",

    year: "numeric",

  });

}



function formatRoleLabel(roleName: string | null) {

  if (!roleName) return "Unassigned";

  return roleName

    .split("_")

    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())

    .join(" ");

}



export function AdminTeamSection() {

  const queryClient = useQueryClient();



  const [search, setSearch] = useState("");

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const [viewUser, setViewUser] = useState<AdminTeamUser | null>(null);

  const [editUser, setEditUser] = useState<AdminTeamUser | null>(null);

  const [deleteUser, setDeleteUser] = useState<AdminTeamUser | null>(null);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);



  const usersQuery = useQuery({

    queryKey: [...TEAM_QUERY_KEY, "users", search],

    queryFn: () => adminTeamApi.listUsers({ search: search.trim() || undefined, limit: 100 }),

  });



  const invitationsQuery = useQuery({

    queryKey: [...TEAM_QUERY_KEY, "invitations"],

    queryFn: () => adminTeamApi.listInvitations({ status: "pending", limit: 50 }),

  });



  const updateMutation = useMutation({

    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateAdminTeamUserPayload }) =>

      adminTeamApi.updateUser(userId, payload),

    onSuccess: () => {
      toast.success("User updated successfully");
      setEditUser(null);
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
    },

    onError: (error: any) => {

      toast.error(error?.response?.data?.message || "Failed to update user");

    },

  });



  const deleteMutation = useMutation({

    mutationFn: adminTeamApi.deleteUser,

    onSuccess: (data) => {

      toast.success(data.message || "User deactivated");

      setDeleteUser(null);

      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });

    },

    onError: (error: any) => {

      toast.error(error?.response?.data?.message || "Failed to deactivate user");

    },

  });



  const revokeMutation = useMutation({

    mutationFn: adminTeamApi.revokeInvitation,

    onSuccess: (data) => {

      toast.success(data.message || "Invitation revoked");

      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });

    },

    onError: (error: any) => {

      toast.error(error?.response?.data?.message || "Failed to revoke invitation");

    },

  });



  const remindMutation = useMutation({

    mutationFn: adminTeamApi.remindInvitation,

    onSuccess: (data) => {

      toast.success(data.message || "Reminder sent");

    },

    onError: (error: any) => {

      toast.error(error?.response?.data?.message || "Failed to send reminder");

    },

  });



  const users = usersQuery.data?.items ?? [];

  const stats = usersQuery.data?.stats ?? {

    total: users.length,

    active: users.filter((u) => u.status === "active").length,

    inactive: users.filter((u) => u.status === "inactive").length,

    pending: users.filter((u) => u.status === "pending").length,

  };



  const pendingInvitations = invitationsQuery.data?.items ?? [];

  const pendingCount = invitationsQuery.data?.total ?? 0;



  const kpiCards = useMemo(

    () => [

      {

        label: "Team Members",

        value: stats.total,

        icon: Users,

        color: "text-blue-600",

        bg: "bg-blue-50",

      },

      {

        label: "Active Users",

        value: stats.active,

        icon: UserCheck,

        color: "text-emerald-600",

        bg: "bg-emerald-50",

      },

      {

        label: "Inactive Users",

        value: stats.inactive,

        icon: UserX,

        color: "text-red-600",

        bg: "bg-red-50",

      },

      {

        label: "Pending Invitations",

        value: pendingCount,

        icon: Mail,

        color: "text-orange-600",

        bg: "bg-orange-50",

      },

    ],

    [stats, pendingCount]

  );



  return (

    <div className="space-y-6">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">

        <button

          onClick={() => setInviteDialogOpen(true)}

          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"

        >

          <UserPlus className="h-4 w-4" />

          Invite User

        </button>

      </div>



      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        {kpiCards.map((card) => (

          <div

            key={card.label}

            className="rounded-xl border border-gray-200/80 bg-white p-4 transition-all hover:shadow-sm"

          >

            <div className="flex items-center gap-3">

              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", card.bg)}>

                <card.icon className={cn("h-5 w-5", card.color)} />

              </div>

              <div>

                <p className="text-lg font-bold text-gray-900">{card.value}</p>

                <p className="text-[11px] font-medium text-gray-500">{card.label}</p>

              </div>

            </div>

          </div>

        ))}

      </div>



      <div className="rounded-xl border border-gray-200/80 bg-white p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">

          <div>

            <h3 className="text-base font-semibold text-gray-900">Team Members</h3>

            <p className="text-xs text-gray-500">

              Active and invited users across the admin portal

            </p>

          </div>

          <div className="relative w-full sm:max-w-xs">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input

              type="text"

              placeholder="Search by name, email, or role..."

              value={search}

              onChange={(e) => setSearch(e.target.value)}

              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"

            />

          </div>

        </div>



        {usersQuery.isLoading ? (

          <div className="flex items-center justify-center py-8 text-gray-500">

            <Loader2 className="h-5 w-5 animate-spin mr-2" />

            Loading team members...

          </div>

        ) : usersQuery.isError ? (

          <div className="rounded-lg border border-red-100 bg-red-50 p-8 text-center">

            <p className="text-sm text-red-600">Failed to load team members. Please try again.</p>

          </div>

        ) : users.length === 0 ? (

          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">

            <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />

            <p className="text-sm text-gray-500">

              {search.trim() ? "No team members match your search" : "No team members yet"}

            </p>

          </div>

        ) : (

          <div className="space-y-2">

            {users.map((user) => {

              const roleName = formatRoleLabel(user.role);

              return (

                <div

                  key={user.id}

                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"

                >

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">

                      {getInitials(user.name || user.email)}

                    </div>

                    <div className="min-w-0">

                      <p className="font-medium text-gray-900 truncate">{user.name || "Unnamed user"}</p>

                      <p className="text-sm text-gray-500 truncate">{user.email}</p>

                      <p className="text-xs text-gray-400 mt-0.5">

                        {roleName}

                        {user.branch?.name ? ` · ${user.branch.name}` : ""}

                        {" · Last login "}

                        {formatDate(user.lastLogin)}

                      </p>

                    </div>

                  </div>



                  <div className="flex items-center gap-2 shrink-0">

                    <span

                      className={cn(

                        "rounded-full px-3 py-1 text-xs font-medium",

                        user.status === "active"

                          ? "bg-green-50 text-green-700"

                          : user.status === "pending"

                            ? "bg-amber-50 text-amber-700"

                            : "bg-gray-100 text-gray-600"

                      )}

                    >

                      {user.status === "active"

                        ? "Active"

                        : user.status === "pending"

                          ? "Pending"

                          : "Inactive"}

                    </span>



                    <div className="relative">

                      <button

                        type="button"

                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}

                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"

                      >

                        <MoreHorizontal className="h-4 w-4" />

                      </button>

                      {openDropdown === user.id && (

                        <>

                          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />

                          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">

                            <button

                              type="button"

                              onClick={() => {

                                setViewUser(user);

                                setOpenDropdown(null);

                              }}

                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"

                            >

                              <Eye className="h-4 w-4 text-gray-400" /> View

                            </button>

                            <button

                              type="button"

                              onClick={() => {

                                setEditUser(user);

                                setOpenDropdown(null);

                              }}

                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"

                            >

                              <Pencil className="h-4 w-4 text-gray-400" /> Edit

                            </button>

                            <div className="my-1 border-t border-gray-100" />

                            <button

                              type="button"

                              onClick={() => {

                                setDeleteUser(user);

                                setOpenDropdown(null);

                              }}

                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"

                            >

                              <Trash2 className="h-4 w-4" /> Delete

                            </button>

                          </div>

                        </>

                      )}

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>



      <div className="rounded-xl border border-gray-200/80 bg-white p-5">

        <div className="mb-4">

          <h3 className="text-base font-semibold text-gray-900">Pending Invitations</h3>

          <p className="text-xs text-gray-500">Invitations waiting to be accepted</p>

        </div>



        {invitationsQuery.isLoading ? (

          <div className="flex items-center justify-center py-8 text-gray-500">

            <Loader2 className="h-5 w-5 animate-spin mr-2" />

            Loading invitations...

          </div>

        ) : pendingInvitations.length === 0 ? (

          <p className="text-sm text-gray-500">No pending invitations.</p>

        ) : (

          <div className="space-y-3">

            {pendingInvitations.map((invitation) => (

              <div

                key={invitation.id}

                className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"

              >

                <div>

                  <p className="font-medium text-gray-900">

                    {invitation.invitedName || invitation.email}

                  </p>

                  <p className="text-sm text-gray-500 flex items-center gap-1">

                    <Mail className="h-3.5 w-3.5" />

                    {invitation.email}

                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">

                    {formatRoleLabel(invitation.role)}

                    {invitation.branch?.name ? ` · ${invitation.branch.name}` : ""}

                  </p>

                </div>

                <div className="flex items-center gap-2">

                  <button

                    type="button"

                    disabled={remindMutation.isPending}

                    onClick={() => remindMutation.mutate(invitation.id)}

                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"

                  >

                    <Send className="h-3.5 w-3.5" />

                    Remind

                  </button>

                  <button

                    type="button"

                    disabled={revokeMutation.isPending}

                    onClick={() => revokeMutation.mutate(invitation.id)}

                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"

                  >

                    <X className="h-3.5 w-3.5" />

                    Revoke

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>



      <InviteUserDialog

        open={inviteDialogOpen}

        onClose={() => setInviteDialogOpen(false)}

        onSuccess={() => {

          queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });

        }}

      />



      <ViewTeamUserDialog

        open={!!viewUser}

        user={viewUser}

        onClose={() => setViewUser(null)}

      />



      <EditTeamUserDialog

        open={!!editUser}

        user={editUser}

        saving={updateMutation.isPending}

        onClose={() => setEditUser(null)}

        onSave={(userId, payload) => updateMutation.mutate({ userId, payload })}

      />



      <ConfirmDialog

        open={!!deleteUser}

        onOpenChange={(open) => !open && setDeleteUser(null)}

        title="Deactivate user?"

        description={`This will deactivate ${deleteUser?.name || deleteUser?.email || "this user"} and revoke their active sessions. They will no longer be able to log in.`}

        confirmLabel="Deactivate"

        variant="destructive"

        loading={deleteMutation.isPending}

        onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)}

      />

    </div>

  );

}


