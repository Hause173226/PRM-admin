import { User } from './index';

// Request parameters cho API get users
export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: 'Admin' | 'User' | 'Staff';
  isActive?: boolean;
  search?: string;
}

// Response từ API get users
export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request body cho tạo user mới
export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  displayName?: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  address: string;
  role: 'Admin' | 'User' | 'Staff';
}

// Request body cho cập nhật user
export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  address?: string;
  role?: 'Admin' | 'User' | 'Staff';
  isActive?: boolean;
}

// Request body cho cập nhật status
export interface UpdateUserStatusRequest {
  isActive: boolean;
}

// Response thống kê user
export interface UserStatsResponse {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  users: number;
  staffs: number;
}

