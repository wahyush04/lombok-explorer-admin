import { PaginationMeta } from './api.types';
export type { PaginationMeta } from './api.types';

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'INACTIVE';

export type TravelStyle =
  | 'NATURE_ADVENTURE'
  | 'BEACH_RELAXATION'
  | 'CULTURE_HERITAGE'
  | 'CULINARY_EXPLORER'
  | 'PHOTOGRAPHY_SPOTS'
  | 'FAMILY_FRIENDLY';

export type Region =
  | 'LOMBOK_SELATAN'
  | 'LOMBOK_UTARA'
  | 'LOMBOK_BARAT'
  | 'LOMBOK_TIMUR'
  | 'LOMBOK_TENGAH'
  | 'GILI_ISLANDS';

export interface UserStats {
  favoritesCount?: number;
  reviewsCount?: number;
  itinerariesCount?: number;
  journalsCount?: number;
}

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  role: UserRole;
  status?: UserStatus | null;
  travelStyle?: TravelStyle | null;
  preferredRegion?: Region | null;
  isEmailVerified: boolean;
  suspendReason?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  stats?: UserStats;
}

export type User = AdminUserDto;
export type AdminUser = AdminUserDto;
export type LoginCredentials = AdminLoginRequest;
export type AuthResponse = AdminAuthData;

export interface AdminAuthData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: AdminUserDto;
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  data: AdminAuthData;
}

export interface AdminProfileResponse {
  success: boolean;
  message: string;
  data: AdminUserDto;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface UpdateUserStatusDto {
  status: UserStatus;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}
