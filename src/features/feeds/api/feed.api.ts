import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  AdminPostReportListItem,
  FeedReportFilters,
  AdminUpdateReportStatusRequest,
  AdminUpdateReportStatusResponse,
  AdminUpdatePostStatusRequest,
  AdminPostStatusUpdateResponse,
  ReportStatus,
} from '@/types/feed.types';

export const feedApi = {
  async getAllPosts(params?: Record<string, unknown>): Promise<any> {
    return apiClient.get('/feeds/posts', params);
  },

  async getAllComments(params?: Record<string, unknown>): Promise<any> {
    return apiClient.get('/feeds/comments', params);
  },

  async deleteComment(id: string): Promise<any> {
    return apiClient.delete(`/feeds/comments/${id}`);
  },
  // Feed Reports (OpenAPI /feeds/reports)
  getReports: async (filters?: FeedReportFilters): Promise<PaginatedApiResponse<AdminPostReportListItem[]>> => {
    return apiClient.get<PaginatedApiResponse<AdminPostReportListItem[]>>('/feeds/reports', filters as Record<string, unknown>);
  },

  getReportById: async (id: string): Promise<ApiResponse<AdminPostReportListItem>> => {
    return apiClient.get<ApiResponse<AdminPostReportListItem>>(`/feeds/reports/${id}`);
  },

  resolveReport: async (
    id: string,
    dto: AdminUpdateReportStatusRequest
  ): Promise<ApiResponse<AdminUpdateReportStatusResponse['data']>> => {
    return apiClient.patch<ApiResponse<AdminUpdateReportStatusResponse['data']>>(`/feeds/reports/${id}`, dto);
  },

  // Moderate Post Status (OpenAPI /feeds/posts/{id}/status)
  updatePostStatus: async (
    postId: string,
    dto: AdminUpdatePostStatusRequest
  ): Promise<ApiResponse<AdminPostStatusUpdateResponse['data']>> => {
    return apiClient.patch<ApiResponse<AdminPostStatusUpdateResponse['data']>>(`/feeds/posts/${postId}/status`, dto);
  },

  // Backwards-compatible alias for existing components
  getFeeds: async (filters?: FeedReportFilters): Promise<PaginatedApiResponse<AdminPostReportListItem[]>> => {
    return apiClient.get<PaginatedApiResponse<AdminPostReportListItem[]>>('/feeds/reports', filters as Record<string, unknown>);
  },

  moderateFeed: async (
    id: string,
    dto: { status: ReportStatus; moderationNotes?: string }
  ): Promise<ApiResponse<AdminUpdateReportStatusResponse['data']>> => {
    return apiClient.patch<ApiResponse<AdminUpdateReportStatusResponse['data']>>(`/feeds/reports/${id}`, {
      status: dto.status,
      adminNotes: dto.moderationNotes,
    });
  },
};
