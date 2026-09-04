import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api.types';
import {
  AuditLog,
  AuditLogFilters,
} from '@/types/audit.types';

export const auditApi = {
  getAuditLogs: async (filters?: AuditLogFilters): Promise<PaginatedApiResponse<AuditLog[]>> => {
    return apiClient.get<PaginatedApiResponse<AuditLog[]>>('/audit-logs', filters as Record<string, unknown>);
  },

  getAuditLogById: async (id: string): Promise<ApiResponse<AuditLog>> => {
    return apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);
  },
};
