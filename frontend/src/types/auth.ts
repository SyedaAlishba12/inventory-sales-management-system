export type UserRole = "admin" | "staff";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
