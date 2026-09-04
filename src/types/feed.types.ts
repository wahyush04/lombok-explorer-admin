import { PaginationMeta } from './auth.types';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
export type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'HARASSMENT' | 'FRAUD' | 'MISLEADING' | 'OTHER';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'DELETED';
export type FeedStatus = PostStatus | 'APPROVED' | 'REJECTED';

export interface Feed {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  userName?: string;
  userAvatar?: string | null;
  content?: string;
  caption?: string;
  title?: string;
  locationName?: string;
  locationTag?: string;
  mediaUrls?: string[];
  images?: string[];
  likesCount?: number;
  commentsCount?: number;
  reportsCount?: number;
  flaggedCount?: number;
  isFlagged?: boolean;
  status: FeedStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FeedFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: FeedStatus | ReportStatus;
  isFlagged?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface FeedReportFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReportStatus;
  reason?: ReportReason;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ModerateFeedDto {
  status: FeedStatus;
  moderationNotes?: string;
  reason?: string;
  rejectionReason?: string;
}

export interface AdminPostReportListItem {
  id: string;
  postId: string;
  post?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    mediaUrls?: string[];
    author?: {
      id: string;
      name: string;
      username: string;
    };
  } | null;
  reporter: {
    id: string;
    name: string;
    username: string;
  };
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  adminNotes?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPostReportListResponse {
  success: boolean;
  message: string;
  data: AdminPostReportListItem[];
  meta: PaginationMeta;
}

export interface AdminPostReportDetailResponse {
  success: boolean;
  message: string;
  data: AdminPostReportListItem;
}

export interface AdminUpdateReportStatusRequest {
  status: ReportStatus;
  adminNotes?: string;
}

export interface AdminUpdateReportStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    postId: string;
    status: ReportStatus;
    adminNotes?: string | null;
    resolvedBy?: string | null;
    resolvedAt?: string | null;
    updatedAt: string;
  };
}

export interface AdminUpdatePostStatusRequest {
  status: PostStatus;
  adminNotes?: string;
}

export interface AdminPostStatusUpdateResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: PostStatus;
    title: string;
    deletedAt?: string | null;
    updatedAt: string;
  };
}
