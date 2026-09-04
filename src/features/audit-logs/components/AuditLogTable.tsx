import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/audit.api';
import { AuditLog, AuditLogFilters, AuditAction, AuditEntityType } from '@/types/audit.types';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils/format';
import { AuditLogDetailModal } from './AuditLogDetailModal';
import { ShieldCheck, Eye, Clock, User, ShieldAlert } from 'lucide-react';

export function AuditLogTable() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 15,
    search: '',
    action: undefined,
    entityType: undefined,
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const res = await auditApi.getAuditLogs(filters);
      return res;
    },
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="success" className="text-[10px]">CREATE</Badge>;
      case 'UPDATE':
        return <Badge variant="secondary" className="text-[10px]">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="destructive" className="text-[10px]">DELETE</Badge>;
      case 'STATUS_CHANGE':
        return <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">STATUS_CHANGE</Badge>;
      case 'BULK_ACTION':
        return <Badge variant="default" className="text-[10px] bg-indigo-600">BULK_ACTION</Badge>;
      case 'LOGIN':
        return <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">LOGIN</Badge>;
      case 'LOGOUT':
        return <Badge variant="outline" className="text-[10px] text-slate-500">LOGOUT</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
          placeholder="Cari nama admin, entitas target..."
          className="w-full lg:w-72"
        />

        <div className="flex items-center space-x-2">
          <Select
            value={filters.action || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                action: (e.target.value as AuditAction) || undefined,
                page: 1,
              }))
            }
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Tindakan</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="BULK_ACTION">BULK_ACTION</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
          </Select>

          <Select
            value={filters.entityType || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                entityType: (e.target.value as AuditEntityType) || undefined,
                page: 1,
              }))
            }
            className="w-40 h-9 text-xs"
          >
            <option value="">Semua Entitas</option>
            <option value="DESTINATION">DESTINATION</option>
            <option value="CATEGORY">CATEGORY</option>
            <option value="RESTAURANT">RESTAURANT</option>
            <option value="ACCOMMODATION">ACCOMMODATION</option>
            <option value="USER">USER</option>
            <option value="REVIEW">REVIEW</option>
            <option value="FEED">FEED</option>
            <option value="ITINERARY">ITINERARY</option>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      {isError ? (
        <ErrorState message="Gagal memuat catatan audit log." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="Tidak ada catatan audit log"
          description="Aktivitas administrator dan perubahan data akan dicatat secara otomatis di sini."
          icon={<ShieldCheck className="h-7 w-7" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tindakan (Action)</TableHead>
                <TableHead>Entitas</TableHead>
                <TableHead>Target Objek</TableHead>
                <TableHead>Administrator (Actor)</TableHead>
                <TableHead>Waktu Log</TableHead>
                <TableHead className="text-right">Rincian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {log.entityType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-xs font-medium text-slate-800">
                      {log.entityName || log.entityId || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {log.actorName ? log.actorName.charAt(0) : 'A'}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">{log.actorName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 font-mono">{formatDateTime(log.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                      title="Lihat Log Lengkap"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            meta={meta}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Audit Detail Modal */}
      <AuditLogDetailModal
        open={Boolean(selectedLog)}
        onOpenChange={(open) => !open && setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}
