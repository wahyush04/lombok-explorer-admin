import { PaginationMeta, Region } from './auth.types';
import { DestinationStatus } from './destination.types';
import { CloudinaryAsset } from './upload.types';

export interface AdminRestaurantDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisineType: string;
  specialtyDish: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  rating?: number;
  reviewCount?: number;
  address: string;
  region: Region;
  latitude: number;
  longitude: number;
  openingHours: string;
  coverImageUrl: string;
  images?: string[];
  isHalalCertified: boolean;
  status: DestinationStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminRestaurantListResponse {
  success: boolean;
  message: string;
  data: AdminRestaurantDto[];
  meta: PaginationMeta;
}

export interface AdminRestaurantDetailResponse {
  success: boolean;
  message: string;
  data: AdminRestaurantDto;
}

export interface CreateRestaurantRequest {
  name: string;
  slug?: string;
  description: string;
  cuisineType: string;
  specialtyDish: string;
  priceRange: string;
  minPrice?: number;
  maxPrice?: number;
  address: string;
  region: Region;
  latitude: number;
  longitude: number;
  openingHours: string;
  coverImage?: CloudinaryAsset | string;
  coverImageUrl?: string;
  images?: (CloudinaryAsset | string)[];
  isHalalCertified?: boolean;
  status?: DestinationStatus;
  isFeatured?: boolean;
}

export interface UpdateRestaurantRequest {
  name?: string;
  slug?: string;
  description?: string;
  cuisineType?: string;
  specialtyDish?: string;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
  address?: string;
  region?: Region;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  coverImage?: CloudinaryAsset | string;
  coverImageUrl?: string;
  images?: (CloudinaryAsset | string)[];
  isHalalCertified?: boolean;
  status?: DestinationStatus;
  isFeatured?: boolean;
}

export type Restaurant = AdminRestaurantDto;
export type RestaurantStatus = DestinationStatus;

export interface RestaurantFilters {
  page?: number;
  limit?: number;
  search?: string;
  region?: Region;
  cuisineType?: string;
  status?: DestinationStatus;
  isHalalCertified?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export type CreateRestaurantDto = CreateRestaurantRequest;
export type UpdateRestaurantDto = UpdateRestaurantRequest;

