export interface UserUpdate {
  full_name?: string | null;
  email?: string | null;
}

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}
