import { PaginationMeta, Region } from './auth.types';
import { DestinationStatus } from './destination.types';
import { CloudinaryAsset } from './upload.types';
import { AccommodationTranslationDto } from './localization.types';

export interface AdminAccommodationDto {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  pricePerNight: number;
  currency?: string;
  address: string;
  region: Region;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  images?: string[];
  facilities?: string[];
  amenities?: string[];
  contactPhone?: string | null;
  websiteUrl?: string | null;
  status: DestinationStatus;
  isFeatured: boolean;
  translations?: AccommodationTranslationDto[];
  availableLocales?: string[];
  missingLocales?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminAccommodationListResponse {
  success: boolean;
  message: string;
  data: AdminAccommodationDto[];
  meta: PaginationMeta;
}

export interface AdminAccommodationDetailResponse {
  success: boolean;
  message: string;
  data: AdminAccommodationDto;
}

export interface CreateAccommodationRequest {
  name: string;
  slug?: string;
  type: string;
  description: string;
  pricePerNight: number;
  currency?: string;
  address: string;
  region: Region;
  latitude: number;
  longitude: number;
  coverImage?: CloudinaryAsset | string;
  coverImageUrl?: string;
  images?: (CloudinaryAsset | string)[];
  facilities?: string[];
  contactPhone?: string;
  websiteUrl?: string;
  status?: DestinationStatus;
  isFeatured?: boolean;
  translations?: AccommodationTranslationDto[];
}

export interface UpdateAccommodationRequest {
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  pricePerNight?: number;
  currency?: string;
  address?: string;
  region?: Region;
  latitude?: number;
  longitude?: number;
  coverImage?: CloudinaryAsset | string;
  coverImageUrl?: string;
  images?: (CloudinaryAsset | string)[];
  facilities?: string[];
  contactPhone?: string;
  websiteUrl?: string;
  status?: DestinationStatus;
  isFeatured?: boolean;
  translations?: AccommodationTranslationDto[];
}

export type Accommodation = AdminAccommodationDto;
export type AccommodationStatus = DestinationStatus;

export interface AccommodationImageDto {
  id: string;
  accommodationId: string;
  imageUrl: string;
  imagePublicId?: string | null;
  caption?: string | null;
  altText?: string | null;
  orderIndex: number;
  isPrimary: boolean;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  bytes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccommodationImageListResponse {
  success: boolean;
  message: string;
  data: AccommodationImageDto[];
}

export interface AccommodationImageDetailResponse {
  success: boolean;
  message: string;
  data: AccommodationImageDto;
}

export interface CreateAccommodationImageRequest {
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

export interface UpdateAccommodationImageRequest {
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

export type AccommodationImage = AccommodationImageDto;
export type CreateAccommodationImageDto = CreateAccommodationImageRequest;
export type UpdateAccommodationImageDto = UpdateAccommodationImageRequest;

export type CreateAccommodationDto = CreateAccommodationRequest;
export type UpdateAccommodationDto = UpdateAccommodationRequest;

export interface AccommodationFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  region?: Region;
  status?: AccommodationStatus;
  sortBy?: string;
  order?: 'asc' | 'desc';
}


