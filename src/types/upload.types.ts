import { ApiResponse } from './api.types';

export type UploadResourceType =
  | 'DESTINATION'
  | 'DESTINATION_IMAGE'
  | 'CATEGORY'
  | 'RESTAURANT'
  | 'RESTAURANT_IMAGE'
  | 'ACCOMMODATION'
  | 'ACCOMMODATION_IMAGE'
  | 'ITINERARY_TEMPLATE'
  | 'USER_AVATAR'
  | 'REVIEW'
  | 'FEED';

export interface AdminUploadSignatureRequest {
  resourceType: UploadResourceType;
  resourceId?: string | null;
}

export interface AdminUploadSignatureData {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
  allowedFormats: string[];
  maxFileSize: number;
  resourceType: UploadResourceType;
  uploadSessionId: string;
}

export type AdminUploadSignatureResponse = ApiResponse<AdminUploadSignatureData>;

export interface CloudinaryAsset {
  publicId: string;
  secureUrl: string;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  bytes?: number | null;
  originalFilename?: string | null;
  resourceType?: string | null;
  orderIndex?: number;
  isPrimary?: boolean;
  caption?: string;
  altText?: string;
}

export type UploadStatus =
  | 'idle'
  | 'pending'
  | 'uploading'
  | 'uploaded'
  | 'failed'
  | 'cancelled';

export interface UploadItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number;
  asset?: CloudinaryAsset;
  error?: string;
  abortController?: AbortController;
}

export interface CloudinaryDirectUploadResponse {
  asset_id?: string;
  public_id: string;
  version?: number;
  version_id?: string;
  signature?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
  bytes?: number;
  type?: string;
  etag?: string;
  url?: string;
  secure_url: string;
  original_filename?: string;
}
