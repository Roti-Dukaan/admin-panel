"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Mail, Phone, UserPlus, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { branchTeamApi } from "@/lib/api/branch-team.api"
import { normalizeEmail } from "@/lib/utils/email"

const TEAM_QUERY_KEY = ["branch", "team"] as const

export function BranchTeamSection() {
  const queryClient = useQueryClient()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")

  const managersQuery = useQuery({
    queryKey: [...TEAM_QUERY_KEY, "managers"],
    queryFn: () => branchTeamApi.listManagers(),
  })

  const invitationsQuery = useQuery({
    queryKey: [...TEAM_QUERY_KEY, "invitations"],
    queryFn: () => branchTeamApi.listInvitations(),
  })

  const inviteMutation = useMutation({
    mutationFn: branchTeamApi.inviteManager,
    onSuccess: (data) => {
      toast.success(data.message)
      setName("")
      setEmail("")
      setPhone("")
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to invite manager")
    },
  })

  const revokeMutation = useMutation({
    mutationFn: branchTeamApi.revokeInvitation,
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to revoke invitation")
    },
  })

  const managers = managersQuery.data ?? []
  const invitations = invitationsQuery.data ?? []
  const isLoading = managersQuery.isLoading || invitationsQuery.isLoading

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Name, email, and phone are required")
      return
    }

    const normalizedPhone = phone.replace(/[\s()-]/g, "")
    if (!/^(\+91)?[6-9]\d{9}$/.test(normalizedPhone) && !/^[6-9]\d{9}$/.test(normalizedPhone)) {
      toast.error("Enter a valid 10-digit mobile number")
      return
    }

    const normalizedEmail = normalizeEmail(email)
    if (managers.some((manager) => manager.email.toLowerCase() === normalizedEmail)) {
      toast.error("This manager is already on the team")
      return
    }
    if (invitations.some((invitation) => invitation.email.toLowerCase() === normalizedEmail)) {
      toast.error("An invitation has already been sent to this email")
      return
    }

    inviteMutation.mutate({ name: name.trim(), email: normalizedEmail, phone: phone.trim() })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Branch Managers
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Invite additional managers with the same branch access and permissions.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading team...
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {managers.length === 0 ? (
              <p className="text-sm text-gray-500">No active managers found for this branch.</p>
            ) : (
              managers.map((manager) => (
                <div
                  key={manager.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{manager.name || "Unnamed manager"}</p>
                    <p className="text-sm text-gray-500">{manager.email}</p>
                    {manager.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3.5 w-3.5" />
                        {manager.phone}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {invitations.length > 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Pending Invitations</h3>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {invitation.invitedName || invitation.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {invitation.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={revokeMutation.isPending}
                  onClick={() => revokeMutation.mutate(invitation.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-1">
          <UserPlus className="h-5 w-5 text-orange-500" />
          Add Manager
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          New managers receive BRANCH_MANAGER access for this branch and can log in with OTP. Add a phone number so they receive escalation calls when orders are not accepted within 1 minute.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="manager-name">Manager Name</Label>
            <Input
              id="manager-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager-email">Email</Label>
            <Input
              id="manager-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(normalizeEmail(e.target.value))}
              placeholder="manager@example.com"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="manager-phone">Phone Number</Label>
            <Input
              id="manager-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
            />
            <p className="text-xs text-gray-500">
              Used for automated voice calls when a new order is not accepted in time.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={inviteMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
