import { AdminUserDto, PaginationMeta, Region, TravelStyle, UserRole, UserStatus } from './auth.types';

export type { UserRole, UserStatus };
export type User = AdminUserDto;

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  travelStyle?: TravelStyle;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export type UpdateUserStatusDto = UpdateUserStatusRequest;

export interface UpdateUserRoleDto {
  role: UserRole;
}

export interface AdminUserListResponse {
  success: boolean;
  message: string;
  data: AdminUserDto[];
  meta: PaginationMeta;
}

export interface AdminUserDetailResponse {
  success: boolean;
  message: string;
  data: AdminUserDto;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  avatarUrl?: string;
  travelStyle?: TravelStyle;
  preferredRegion?: Region;
  isEmailVerified?: boolean;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
  reason?: string;
}
