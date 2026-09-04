import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  User,
  UserFilters,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
} from '@/types/user.types';

export const userApi = {
  getUsers: async (filters?: UserFilters): Promise<PaginatedApiResponse<User[]>> => {
    return apiClient.get<PaginatedApiResponse<User[]>>('/users', filters as Record<string, unknown>);
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    return apiClient.get<ApiResponse<User>>(`/users/${id}`);
  },

  updateUserStatus: async (id: string, dto: UpdateUserStatusDto): Promise<ApiResponse<User>> => {
    return apiClient.patch<ApiResponse<User>>(`/users/${id}/status`, dto);
  },

  updateUserRole: async (id: string, dto: UpdateUserRoleDto): Promise<ApiResponse<User>> => {
    return apiClient.patch<ApiResponse<User>>(`/users/${id}/role`, dto);
  },
};
