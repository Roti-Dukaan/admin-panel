import { apiClient } from "@/lib/api/http"

export interface BranchManagerUser {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export interface BranchManagerInvitation {
  id: string
  email: string
  invitedName: string | null
  expiresAt: string
  createdAt: string
  status: "pending"
}

export interface InviteBranchManagerPayload {
  name: string
  email: string
}

export interface InviteBranchManagerResponse {
  action: "invited" | "assigned"
  message: string
}

function unwrap<T>(response: { data: { success: boolean; data: T } }): T {
  return response.data.data
}

export const branchTeamApi = {
  listManagers: async (): Promise<BranchManagerUser[]> => {
    const response = await apiClient.get<{ success: boolean; data: BranchManagerUser[] }>(
      "/admin/branch/team/managers"
    )
    return unwrap(response)
  },

  listInvitations: async (): Promise<BranchManagerInvitation[]> => {
    const response = await apiClient.get<{ success: boolean; data: BranchManagerInvitation[] }>(
      "/admin/branch/team/invitations"
    )
    return unwrap(response)
  },

  inviteManager: async (payload: InviteBranchManagerPayload): Promise<InviteBranchManagerResponse> => {
    const response = await apiClient.post<{ success: boolean; data: InviteBranchManagerResponse }>(
      "/admin/branch/team/managers",
      payload
    )
    return unwrap(response)
  },

  revokeInvitation: async (invitationId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/branch/team/invitations/${invitationId}`
    )
    return { message: response.data.message }
  },
}
