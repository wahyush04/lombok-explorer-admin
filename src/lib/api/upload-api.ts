import { apiClient } from './api-client';
import {
  UploadResourceType,
  AdminUploadSignatureRequest,
  AdminUploadSignatureResponse,
  AdminUploadSignatureData,
} from '@/types/upload.types';

export const adminUploadApi = {
  /**
   * Request cryptographic Cloudinary upload signature from backend.
   * Forces folder isolation per administrator and resource type.
   */
  getSignature: async (
    resourceType: UploadResourceType,
    resourceId?: string | null
  ): Promise<AdminUploadSignatureData> => {
    const payload: AdminUploadSignatureRequest = {
      resourceType,
      resourceId: resourceId || undefined,
    };
    const response = await apiClient.post<AdminUploadSignatureResponse>('/uploads/signature', payload);
    return response.data;
  },
};
