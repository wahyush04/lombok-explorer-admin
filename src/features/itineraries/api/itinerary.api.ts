import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  ItineraryTemplate,
  ItineraryFilters,
  CreateItineraryTemplateDto,
  UpdateItineraryTemplateDto,
  ItineraryStatus,
} from '@/types/itinerary.types';

export const itineraryApi = {
  getItineraries: async (filters?: ItineraryFilters): Promise<PaginatedApiResponse<ItineraryTemplate[]>> => {
    return apiClient.get<PaginatedApiResponse<ItineraryTemplate[]>>('/itinerary-templates', filters as Record<string, unknown>);
  },

  getItineraryById: async (id: string): Promise<ApiResponse<ItineraryTemplate>> => {
    return apiClient.get<ApiResponse<ItineraryTemplate>>(`/itinerary-templates/${id}`);
  },

  createItinerary: async (data: CreateItineraryTemplateDto): Promise<ApiResponse<ItineraryTemplate>> => {
    return apiClient.post<ApiResponse<ItineraryTemplate>>('/itinerary-templates', data);
  },

  updateItinerary: async (id: string, data: UpdateItineraryTemplateDto): Promise<ApiResponse<ItineraryTemplate>> => {
    return apiClient.put<ApiResponse<ItineraryTemplate>>(`/itinerary-templates/${id}`, data);
  },

  deleteItinerary: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/itinerary-templates/${id}`);
  },

  updateItineraryStatus: async (
    id: string,
    statusOrPublished: ItineraryStatus | boolean
  ): Promise<ApiResponse<ItineraryTemplate>> => {
    const isPublished = typeof statusOrPublished === 'boolean' ? statusOrPublished : statusOrPublished === 'PUBLISHED';
    return apiClient.patch<ApiResponse<ItineraryTemplate>>(`/itinerary-templates/${id}`, { isPublished });
  },
};
