import { PaginationMeta } from './auth.types';

export type ReviewStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
export type ReviewTargetType = 'DESTINATION' | 'RESTAURANT' | 'ACCOMMODATION';

export type Review = AdminReviewDto;
export type ModerateReviewDto = ReviewModerationRequest;

export interface ReviewFilters {
  page?: number;
  limit?: number;
  search?: string;
  targetType?: ReviewTargetType;
  status?: ReviewStatus;
  rating?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface AdminReviewDto {
  id: string;
  userId: string;
  userName?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  destinationId?: string;
  targetId?: string;
  targetName?: string;
  targetType?: ReviewTargetType | string;
  destination?: {
    id: string;
    name: string;
    slug: string;
    locationName: string;
  };
  rating: number;
  content: string;
  comment?: string;
  photos?: string[];
  status: ReviewStatus;
  moderationNotes?: string;
  reason?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewModerationRequest {
  status: ReviewStatus;
  moderationNotes?: string;
  reason?: string;
  rejectionReason?: string;
}

export interface AdminReviewListResponse {
  success: boolean;
  message: string;
  data: AdminReviewDto[];
  meta: PaginationMeta;
}

export interface AdminReviewDetailResponse {
  success: boolean;
  message: string;
  data: AdminReviewDto;
}
