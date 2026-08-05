export type ContactMessageStatus = "NEW" | "READ" | "ARCHIVED";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  ipAddress: string | null;
  userAgent: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageFilters {
  page?: number;
  limit?: number;
  status?: ContactMessageStatus | "all";
  search?: string;
}

export interface ContactMessageListResponse {
  items: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
