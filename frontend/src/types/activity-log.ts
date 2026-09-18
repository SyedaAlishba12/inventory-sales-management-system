export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  created_at: string;
}

export interface ActivityLogListResponse {
  items: ActivityLog[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
