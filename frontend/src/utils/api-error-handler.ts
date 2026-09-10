import type { ApiErrorPayload } from "@/types";

function payloadMessage(payload: ApiErrorPayload | undefined, fallback: string) {
  if (!payload) return fallback;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    return payload.detail.map((issue) => issue.msg).join("; ");
  }
  return payload.message || fallback;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload?: ApiErrorPayload;

  constructor(status: number, payload?: ApiErrorPayload, fallback = "Request failed") {
    super(payloadMessage(payload, fallback));
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}
