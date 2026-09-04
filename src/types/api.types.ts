export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  details?: ErrorDetail[] | string[] | null;
}

export interface StandardActionResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown> | null;
}

export interface ActionSuccessResponse {
  success: true;
  message: string;
}

export type SortOrder = 'asc' | 'desc';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta: PaginationMeta;
}
