import { apiClient } from '@/lib/api/api-client';
import { ApiResponse } from '@/types/api.types';
import { DashboardStatisticsDto } from '@/types/dashboard.types';

export const dashboardApi = {
  getDashboard: async (startDate?: string, endDate?: string): Promise<ApiResponse<DashboardStatisticsDto>> => {
    return apiClient.get<ApiResponse<DashboardStatisticsDto>>('/dashboard', {
      startDate,
      endDate,
    });
  },
};
