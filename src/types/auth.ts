export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'Student' | 'ShopOwner';
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
  };
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
};

export type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null; user: AuthUser | null }
  | { type: 'LOGIN'; token: string; user: AuthUser }
  | { type: 'LOGOUT' };

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  data: T | null;
}
