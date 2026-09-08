export type QueryPrimitive = string | number | boolean | Date | null | undefined;
export type QueryValue = QueryPrimitive | readonly QueryPrimitive[];
export type QueryParams = Record<string, QueryValue>;

export interface ApiValidationIssue {
  loc?: Array<string | number>;
  msg: string;
  type?: string;
}

export interface ApiErrorPayload {
  detail?: string | ApiValidationIssue[];
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: QueryParams;
  timeoutMs?: number;
  token?: string | null;
}
