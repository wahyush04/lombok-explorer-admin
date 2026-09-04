import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  Review,
  ReviewFilters,
  ModerateReviewDto,
} from '@/types/review.types';

export const reviewApi = {
  getReviews: async (filters?: ReviewFilters): Promise<PaginatedApiResponse<Review[]>> => {
    return apiClient.get<PaginatedApiResponse<Review[]>>('/reviews', filters as Record<string, unknown>);
  },

  getReviewById: async (id: string): Promise<ApiResponse<Review>> => {
    return apiClient.get<ApiResponse<Review>>(`/reviews/${id}`);
  },

  moderateReview: async (id: string, dto: ModerateReviewDto): Promise<ApiResponse<Review>> => {
    return apiClient.patch<ApiResponse<Review>>(`/reviews/${id}/moderate`, dto);
  },

  deleteReview: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/reviews/${id}`);
  },
};
