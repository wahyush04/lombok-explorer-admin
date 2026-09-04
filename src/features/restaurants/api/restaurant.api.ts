import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  Restaurant,
  RestaurantFilters,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantStatus,
} from '@/types/restaurant.types';

export const restaurantApi = {
  getRestaurants: async (filters?: RestaurantFilters): Promise<PaginatedApiResponse<Restaurant[]>> => {
    return apiClient.get<PaginatedApiResponse<Restaurant[]>>('/restaurants', filters as Record<string, unknown>);
  },

  getRestaurantById: async (id: string): Promise<ApiResponse<Restaurant>> => {
    return apiClient.get<ApiResponse<Restaurant>>(`/restaurants/${id}`);
  },

  createRestaurant: async (data: CreateRestaurantDto): Promise<ApiResponse<Restaurant>> => {
    return apiClient.post<ApiResponse<Restaurant>>('/restaurants', data);
  },

  updateRestaurant: async (id: string, data: UpdateRestaurantDto): Promise<ApiResponse<Restaurant>> => {
    return apiClient.put<ApiResponse<Restaurant>>(`/restaurants/${id}`, data);
  },

  deleteRestaurant: async (id: string, hard?: boolean): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/restaurants/${id}`, { hard });
  },

  updateRestaurantStatus: async (id: string, status: RestaurantStatus): Promise<ApiResponse<Restaurant>> => {
    return apiClient.patch<ApiResponse<Restaurant>>(`/restaurants/${id}/status`, { status });
  },
};
