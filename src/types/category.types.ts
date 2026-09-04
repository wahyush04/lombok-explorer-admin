import { PaginationMeta } from './auth.types';
import { DestinationStatus } from './destination.types';

export interface AdminCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  coverImageUrl?: string;
  destinationsCount?: number;
  status?: DestinationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoryListResponse {
  success: boolean;
  message: string;
  data: AdminCategoryDto[];
  meta: PaginationMeta;
}

export interface AdminCategoryDetailResponse {
  success: boolean;
  message: string;
  data: AdminCategoryDto;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description: string;
  iconName: string;
  coverImageUrl?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  iconName?: string;
  coverImageUrl?: string;
}

export type Category = AdminCategoryDto;
export type CategoryStatus = DestinationStatus;

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: DestinationStatus;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export type CreateCategoryDto = CreateCategoryRequest;
export type UpdateCategoryDto = UpdateCategoryRequest;

