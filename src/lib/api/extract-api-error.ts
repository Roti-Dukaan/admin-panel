import { isAxiosError } from "axios";

export function extractApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[]; errors?: string[] }
      | undefined;
    const errors = data?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.join(", ");
    }
    const message = data?.message;
    if (Array.isArray(message) && message.length > 0) {
      return message.join(", ");
    }
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
