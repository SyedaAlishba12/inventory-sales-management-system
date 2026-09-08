export type Identifier = string | number;

export interface SelectOption<TValue extends Identifier = string> {
  label: string;
  value: TValue;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  detail: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
