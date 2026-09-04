import { PaginationMeta, Region } from './auth.types';
import { DestinationStatus } from './destination.types';

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
  coverImageUrl: string;
  images?: string[];
  facilities?: string[];
  contactPhone?: string;
  websiteUrl?: string;
  status?: DestinationStatus;
  isFeatured?: boolean;
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
  coverImageUrl?: string;
  images?: string[];
  facilities?: string[];
  contactPhone?: string;
  websiteUrl?: string;
  status?: DestinationStatus;
  isFeatured?: boolean;
}

export type Accommodation = AdminAccommodationDto;
export type AccommodationStatus = DestinationStatus;
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

