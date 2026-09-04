export * from './audit-log.types';
import { AdminAuditLogItem } from './audit-log.types';

export type AuditLog = AdminAuditLogItem;
export type AuditAction = string;
export type AuditEntityType = string;

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  resource?: string;
  entity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
