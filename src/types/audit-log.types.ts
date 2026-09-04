import { PaginationMeta, UserRole } from './auth.types';

export interface AdminAuditLogUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  avatarUrl?: string | null;
}

export interface AdminAuditLogItem {
  id: string;
  userId?: string | null;
  user?: AdminAuditLogUser | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  entity: string;
  entityType?: string;
  entityName?: string;
  entityId?: string | null;
  actorName?: string;
  actorEmail?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  timestamp: string;
}

export interface AdminAuditLogListResponse {
  success: boolean;
  message: string;
  data: AdminAuditLogItem[];
  meta: PaginationMeta;
}

export interface AdminAuditLogDetailResponse {
  success: boolean;
  message: string;
  data: AdminAuditLogItem;
}
