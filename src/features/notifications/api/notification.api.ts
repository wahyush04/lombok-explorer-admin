import { apiClient } from '@/lib/api/api-client';
import { ApiResponse } from '@/types/api.types';
import {
  AdminBroadcastNotificationRequest,
  AdminBroadcastResult,
  NotificationDeviceStats,
} from '@/types/notification.types';

export const notificationApi = {
  async getStats(): Promise<ApiResponse<NotificationDeviceStats>> {
    return apiClient.get<ApiResponse<NotificationDeviceStats>>('/notifications/stats');
  },

  async sendBroadcast(data: AdminBroadcastNotificationRequest): Promise<ApiResponse<AdminBroadcastResult>> {
    return apiClient.post<ApiResponse<AdminBroadcastResult>>('/notifications/broadcast', data);
  },
};
