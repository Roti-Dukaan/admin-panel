import { apiClient } from "@/lib/api/http"

export interface AdminInvitation {
  id: string
  email: string
  role: string
  invitedName?: string | null
  branch?: { id: string; name: string } | null
  invitedBy?: { id: string; name: string | null; email: string } | null
  expiresAt: string
  acceptedAt?: string | null
  createdAt: string
  status: "pending" | "accepted" | "expired"
}

export interface AdminInvitationsResponse {
  items: AdminInvitation[]
  total: number
  page: number
  limit: number
}

export interface AdminTeamUser {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string | null
  roles: string[]
  branch: { id: string; name: string; code?: string } | null
  status: "active" | "inactive" | "pending"
  isActive: boolean
  lastLogin: string | null
  invitedAt: string
  createdAt: string
  updatedAt: string
}

export interface AdminTeamUsersResponse {
  items: AdminTeamUser[]
  total: number
  page: number
  limit: number
  stats: {
    total: number
    active: number
    inactive: number
    pending: number
  }
}

export interface UpdateAdminTeamUserPayload {
  name?: string
  phone?: string | null
  role?: string
  branchId?: string | null
  isActive?: boolean
}

function unwrap<T>(response: { data: { success: boolean; data: T } }): T {
  return response.data.data
}

export const adminTeamApi = {
  listUsers: async (params?: {
    search?: string
    page?: number
    limit?: number
    status?: "active" | "inactive" | "pending"
  }): Promise<AdminTeamUsersResponse> => {
    const response = await apiClient.get<{ success: boolean; data: AdminTeamUsersResponse }>(
      "/admin/users",
      { params }
    )
    return unwrap(response)
  },

  getUser: async (userId: string): Promise<AdminTeamUser> => {
    const response = await apiClient.get<{ success: boolean; data: AdminTeamUser }>(
      `/admin/users/${userId}`
    )
    return unwrap(response)
  },

  updateUser: async (
    userId: string,
    payload: UpdateAdminTeamUserPayload
  ): Promise<AdminTeamUser> => {
    const response = await apiClient.patch<{ success: boolean; data: AdminTeamUser }>(
      `/admin/users/${userId}`,
      payload
    )
    return unwrap(response)
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/users/${userId}`
    )
    return { message: response.data.message }
  },

  listInvitations: async (params?: {
    status?: "pending" | "accepted" | "expired"
    page?: number
    limit?: number
  }): Promise<AdminInvitationsResponse> => {
    const response = await apiClient.get<{ success: boolean; data: AdminInvitationsResponse }>(
      "/admin/invitations",
      { params }
    )
    return unwrap(response)
  },

  revokeInvitation: async (invitationId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/invitations/${invitationId}`
    )
    return { message: response.data.message }
  },

  remindInvitation: async (invitationId: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/admin/invitations/${invitationId}/remind`
    )
    return { message: response.data.message }
  },
}
