import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  Destination,
  DestinationDetail,
  DestinationImage,
  DestinationFilters,
  CreateDestinationDto,
  UpdateDestinationDto,
  BulkDeleteDestinationsDto,
  BulkUpdateDestinationStatusDto,
  BulkActionResponse,
  DestinationStatus,
} from '@/types/destination.types';

export const destinationApi = {
  getDestinations: async (filters?: DestinationFilters): Promise<PaginatedApiResponse<Destination[]>> => {
    return apiClient.get<PaginatedApiResponse<Destination[]>>('/destinations', filters as Record<string, unknown>);
  },

  getDestinationById: async (id: string): Promise<ApiResponse<DestinationDetail>> => {
    return apiClient.get<ApiResponse<DestinationDetail>>(`/destinations/${id}`);
  },

  createDestination: async (data: CreateDestinationDto): Promise<ApiResponse<DestinationDetail>> => {
    return apiClient.post<ApiResponse<DestinationDetail>>('/destinations', data);
  },

  updateDestination: async (id: string, data: UpdateDestinationDto): Promise<ApiResponse<DestinationDetail>> => {
    return apiClient.put<ApiResponse<DestinationDetail>>(`/destinations/${id}`, data);
  },

  deleteDestination: async (id: string, hard?: boolean): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/destinations/${id}`, { hard });
  },

  updateDestinationStatus: async (id: string, status: DestinationStatus): Promise<ApiResponse<Destination>> => {
    return apiClient.patch<ApiResponse<Destination>>(`/destinations/${id}/status`, { status });
  },

  bulkDeleteDestinations: async (dto: BulkDeleteDestinationsDto): Promise<ApiResponse<BulkActionResponse>> => {
    return apiClient.post<ApiResponse<BulkActionResponse>>('/destinations/bulk-delete', dto);
  },

  bulkUpdateDestinationStatus: async (dto: BulkUpdateDestinationStatusDto): Promise<ApiResponse<BulkActionResponse>> => {
    return apiClient.post<ApiResponse<BulkActionResponse>>('/destinations/bulk-status', dto);
  },

  // Gallery Images
  getDestinationImages: async (destinationId: string): Promise<ApiResponse<DestinationImage[]>> => {
    return apiClient.get<ApiResponse<DestinationImage[]>>(`/destinations/${destinationId}/images`);
  },

  createDestinationImage: async (
    destinationId: string,
    data: { imageUrl: string; caption?: string; altText?: string; orderIndex?: number; isPrimary?: boolean }
  ): Promise<ApiResponse<DestinationImage>> => {
    return apiClient.post<ApiResponse<DestinationImage>>(`/destinations/${destinationId}/images`, data);
  },

  updateDestinationImage: async (
    destinationId: string,
    imageId: string,
    data: Partial<DestinationImage>
  ): Promise<ApiResponse<DestinationImage>> => {
    return apiClient.put<ApiResponse<DestinationImage>>(`/destinations/${destinationId}/images/${imageId}`, data);
  },

  deleteDestinationImage: async (destinationId: string, imageId: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/destinations/${destinationId}/images/${imageId}`);
  },
};
