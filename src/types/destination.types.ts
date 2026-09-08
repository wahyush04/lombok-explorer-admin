import { PaginationMeta, Region } from './auth.types';
import { CloudinaryAsset } from './upload.types';
import { DestinationTranslationDto } from './localization.types';

export type DestinationStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
export type DestinationDifficulty = 'EASY' | 'MODERATE' | 'CHALLENGING' | 'EXTREME';

export type BulkDeleteDestinationsDto = BulkDeleteDestinationsRequest;
export type BulkUpdateDestinationStatusDto = BulkUpdateDestinationStatusRequest;
export interface BulkActionResponse {
  affectedCount: number;
  message?: string;
}

export interface AdminDestinationDto {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  region: Region;
  locationName: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  rating?: number;
  reviewCount?: number;
  entranceFee?: number;
  ticketPrice?: number;
  currency?: string;
  openingHours?: string;
  estimatedDurationMinutes?: number;
  bestVisitingTime?: string;
  difficulty?: DestinationDifficulty | string;
  tags?: string[];
  coverImageUrl?: string;
  images?: string[];
  facilities?: string[];
  tips?: string[];
  status: DestinationStatus;
  isFeatured?: boolean;
  reviewsCount?: number;
  favoritesCount?: number;
  deletedAt?: string | null;
  translations?: DestinationTranslationDto[];
  availableLocales?: string[];
  missingLocales?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminDestinationListResponse {
  success: boolean;
  message: string;
  data: AdminDestinationDto[];
  meta: PaginationMeta;
}

export interface AdminDestinationDetailResponse {
  success: boolean;
  message: string;
  data: AdminDestinationDto;
}

export interface CreateDestinationRequest {
  name: string;
  slug?: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  region: Region;
  locationName: string;
  address?: string;
  latitude: number;
  longitude: number;
  ticketPrice?: number;
  entranceFee?: number;
  currency?: string;
  openingHours?: string;
  estimatedDurationMinutes?: number;
  bestVisitingTime?: string;
  difficulty?: DestinationDifficulty;
  tags?: string[];
  coverImage?: CloudinaryAsset | string;
  coverImageUrl?: string;
  images?: (CloudinaryAsset | string)[];
  facilities?: string[];
  tips?: string[];
  status?: DestinationStatus;
  isFeatured?: boolean;
  translations?: DestinationTranslationDto[];
}

export interface UpdateDestinationRequest {
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string;
  region?: Region;
  locationName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  ticketPrice?: number;
  entranceFee?: number;
  currency?: string;
  openingHours?: string;
  estimatedDurationMinutes?: number;
  bestVisitingTime?: string;
  difficulty?: DestinationDifficulty;
  tags?: string[];
  coverImage?: CloudinaryAsset | string;
  coverImageUrl?: string;
  images?: (CloudinaryAsset | string)[];
  facilities?: string[];
  tips?: string[];
  status?: DestinationStatus;
  isFeatured?: boolean;
  translations?: DestinationTranslationDto[];
}

export interface BulkDeleteDestinationsRequest {
  ids: string[];
  hard?: boolean;
}

export interface BulkDeleteDestinationsResponse {
  success: boolean;
  message: string;
  data: {
    affectedCount: number;
    hard?: boolean;
  };
}

export interface BulkUpdateDestinationStatusRequest {
  ids: string[];
  status: DestinationStatus;
}

export interface BulkUpdateDestinationStatusResponse {
  success: boolean;
  message: string;
  data: {
    affectedCount: number;
    status: DestinationStatus;
  };
}

export interface UpdateContentStatusRequest {
  status: DestinationStatus;
}

export interface DestinationImageDto {
  id: string;
  destinationId: string;
  imageUrl: string;
  caption?: string | null;
  altText?: string | null;
  orderIndex: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationImageListResponse {
  success: boolean;
  message: string;
  data: DestinationImageDto[];
}

export interface DestinationImageDetailResponse {
  success: boolean;
  message: string;
  data: DestinationImageDto;
}

export interface CreateDestinationImageRequest {
  image?: CloudinaryAsset | string;
  publicId?: string;
  secureUrl?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  caption?: string;
  altText?: string;
  orderIndex?: number;
  isPrimary?: boolean;
}

export interface UpdateDestinationImageRequest {
  image?: CloudinaryAsset | string;
  publicId?: string;
  secureUrl?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  caption?: string;
  altText?: string;
  orderIndex?: number;
  isPrimary?: boolean;
}

export type Destination = AdminDestinationDto;
export type DestinationDetail = AdminDestinationDto;
export type DestinationImage = DestinationImageDto;

export interface DestinationFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  region?: Region;
  status?: DestinationStatus;
  isFeatured?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export type CreateDestinationDto = CreateDestinationRequest;
export type UpdateDestinationDto = UpdateDestinationRequest;
export type CreateDestinationImageDto = CreateDestinationImageRequest;
export type UpdateDestinationImageDto = UpdateDestinationImageRequest;

