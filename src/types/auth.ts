// Login Request & Response
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: AuthUser;
}

// Refresh Token Request & Response
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Logout Request
export interface LogoutRequest {
  refreshToken?: string;
}

// Auth User
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  displayName: string | null;
  phone: string;
  avatarUrl: string;
  bio: string | null;
  address: string;
  role: string;
  isActive: boolean;
}

// API Error Response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

