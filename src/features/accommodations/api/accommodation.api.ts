import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  Accommodation,
  AccommodationFilters,
  CreateAccommodationDto,
  UpdateAccommodationDto,
  AccommodationStatus,
} from '@/types/accommodation.types';

export const accommodationApi = {
  getAccommodations: async (filters?: AccommodationFilters): Promise<PaginatedApiResponse<Accommodation[]>> => {
    return apiClient.get<PaginatedApiResponse<Accommodation[]>>('/accommodations', filters as Record<string, unknown>);
  },

  getAccommodationById: async (id: string): Promise<ApiResponse<Accommodation>> => {
    return apiClient.get<ApiResponse<Accommodation>>(`/accommodations/${id}`);
  },

  createAccommodation: async (data: CreateAccommodationDto): Promise<ApiResponse<Accommodation>> => {
    return apiClient.post<ApiResponse<Accommodation>>('/accommodations', data);
  },

  updateAccommodation: async (id: string, data: UpdateAccommodationDto): Promise<ApiResponse<Accommodation>> => {
    return apiClient.put<ApiResponse<Accommodation>>(`/accommodations/${id}`, data);
  },

  deleteAccommodation: async (id: string, hard?: boolean): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/accommodations/${id}`, { hard });
  },

  updateAccommodationStatus: async (id: string, status: AccommodationStatus): Promise<ApiResponse<Accommodation>> => {
    return apiClient.patch<ApiResponse<Accommodation>>(`/accommodations/${id}/status`, { status });
  },
};
