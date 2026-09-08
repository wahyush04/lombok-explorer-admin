import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  Restaurant,
  RestaurantFilters,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantStatus,
  RestaurantImage,
  CreateRestaurantImageRequest,
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

  // Gallery Images
  getRestaurantImages: async (restaurantId: string): Promise<ApiResponse<RestaurantImage[]>> => {
    return apiClient.get<ApiResponse<RestaurantImage[]>>(`/restaurants/${restaurantId}/images`);
  },

  createRestaurantImage: async (
    restaurantId: string,
    data: CreateRestaurantImageRequest
  ): Promise<ApiResponse<RestaurantImage>> => {
    return apiClient.post<ApiResponse<RestaurantImage>>(`/restaurants/${restaurantId}/images`, data);
  },

  updateRestaurantImage: async (
    restaurantId: string,
    imageId: string,
    data: Partial<RestaurantImage>
  ): Promise<ApiResponse<RestaurantImage>> => {
    return apiClient.put<ApiResponse<RestaurantImage>>(`/restaurants/${restaurantId}/images/${imageId}`, data);
  },

  deleteRestaurantImage: async (restaurantId: string, imageId: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/restaurants/${restaurantId}/images/${imageId}`);
  },
};
