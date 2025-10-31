import api from './api';
import { User } from '../types';
import {
  GetUsersParams,
  GetUsersResponse,
  UpdateUserRequest,
} from '../types/user';

class UserService {
  /**
   * Lấy thông tin profile của user hiện tại
   * GET /api/users/profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/api/users/profile');
    return response.data;
  }

  /**
   * Lấy danh sách người dùng
   * GET /api/users
   */
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    const response = await api.get<User[] | GetUsersResponse>('/api/users', { params });
    
    // Nếu API trả về array trực tiếp, wrap nó vào object
    if (Array.isArray(response.data)) {
      return {
        users: response.data,
        total: response.data.length,
        page: 1,
        limit: response.data.length,
        totalPages: 1
      };
    }
    
    return response.data as GetUsersResponse;
  }

  /**
   * Lấy thông tin chi tiết một người dùng
   * GET /api/users/:id
   */
  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
  }

  /**
   * Cập nhật thông tin người dùng
   * PUT /api/users/:id
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(`/api/users/${id}`, data);
    return response.data;
  }

  /**
   * Cấm người dùng
   * POST /api/users/:id/ban
   */
  async banUser(id: string): Promise<User> {
    const response = await api.post<User>(`/api/users/${id}/ban`);
    return response.data;
  }
}

// Export singleton instance
export default new UserService();

