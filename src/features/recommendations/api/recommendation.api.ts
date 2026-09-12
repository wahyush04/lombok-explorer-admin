import { apiClient } from '@/lib/api/api-client';
import { ApiResponse } from '@/types/api.types';
import { AdminRecommendationItem, CreateAdminRecommendationInput } from '@/types/recommendation.types';

export const recommendationApi = {
  async getRecommendations(): Promise<ApiResponse<AdminRecommendationItem[]>> {
    return apiClient.get<ApiResponse<AdminRecommendationItem[]>>('/recommendations');
  },

  async createRecommendation(data: CreateAdminRecommendationInput): Promise<ApiResponse<AdminRecommendationItem>> {
    return apiClient.post<ApiResponse<AdminRecommendationItem>>('/recommendations', data);
  },

  async deleteRecommendation(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/recommendations/${id}`);
  },
};
