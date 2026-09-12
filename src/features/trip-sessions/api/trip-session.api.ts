import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  AdminLiveMapPoint,
  AdminTripSessionDetail,
  AdminTripSessionListItem,
  TripSessionFilters,
} from '@/types/trip-session.types';

export const tripSessionApi = {
  async getTripSessions(filters?: TripSessionFilters): Promise<PaginatedApiResponse<AdminTripSessionListItem[]>> {
    return apiClient.get<PaginatedApiResponse<AdminTripSessionListItem[]>>('/trip-sessions', filters as Record<string, unknown>);
  },

  async getLiveMapPoints(): Promise<ApiResponse<AdminLiveMapPoint[]>> {
    return apiClient.get<ApiResponse<AdminLiveMapPoint[]>>('/trip-sessions/live-map');
  },

  async getTripSessionById(id: string): Promise<ApiResponse<AdminTripSessionDetail>> {
    return apiClient.get<ApiResponse<AdminTripSessionDetail>>(`/trip-sessions/${id}`);
  },
};
