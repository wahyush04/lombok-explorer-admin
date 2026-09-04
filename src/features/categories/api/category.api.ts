import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  Category,
  CategoryFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryStatus,
} from '@/types/category.types';

export const categoryApi = {
  getCategories: async (filters?: CategoryFilters): Promise<PaginatedApiResponse<Category[]>> => {
    return apiClient.get<PaginatedApiResponse<Category[]>>('/categories', filters as Record<string, unknown>);
  },

  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    return apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
  },

  createCategory: async (data: CreateCategoryDto): Promise<ApiResponse<Category>> => {
    return apiClient.post<ApiResponse<Category>>('/categories', data);
  },

  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<ApiResponse<Category>> => {
    return apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
  },

  deleteCategory: async (id: string, reassignTo?: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/categories/${id}`, { reassignTo });
  },

  updateCategoryStatus: async (id: string, status: CategoryStatus): Promise<ApiResponse<Category>> => {
    return apiClient.patch<ApiResponse<Category>>(`/categories/${id}/status`, { status });
  },
};
