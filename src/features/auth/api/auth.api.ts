import { apiClient } from '@/lib/api/api-client';
import { ApiResponse } from '@/types/api.types';
import { AuthResponse, LoginCredentials, AdminUser } from '@/types/auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>('/auth/logout');
  },

  getMe: async (): Promise<ApiResponse<AdminUser>> => {
    return apiClient.get<ApiResponse<AdminUser>>('/auth/me');
  },
};
