import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripSessionApi } from '../api/trip-session.api';
import {
  AdminTripSessionListItem,
  TripSessionFilters,
  TripSessionStatus,
} from '@/types/trip-session.types';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils/format';
import { LiveTripMap } from './LiveTripMap';
import { TripSessionDetailModal } from './TripSessionDetailModal';
import {
  Navigation,
  Eye,
  CheckCircle2,
  Clock,
  Compass,
  ArrowUpDown,
  Calendar,
} from 'lucide-react';

export function TripSessionTable() {
  const [filters, setFilters] = useState<TripSessionFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    sortBy: 'startedAt',
    order: 'desc',
  });

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['trip-sessions', filters],
    queryFn: async () => {
      const res = await tripSessionApi.getTripSessions(filters);
      return res;
    },
  });

  const sessions = data?.data || [];
  const meta = data?.meta;

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      sortBy: field,
      order: prev.sortBy === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Live Map Monitoring Radar */}
      <LiveTripMap
        onSelectSession={(id) => {
          setSelectedSessionId(id);
          setDetailModalOpen(true);
        }}
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={filters.search || ''}
            onChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
            placeholder="Cari wisatawan atau nama itinerary..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as TripSessionStatus) || undefined,
                page: 1,
              }))
            }
            className="w-40 text-xs h-9"
          >
            <option value="">Semua Status Sesi</option>
            <option value="ACTIVE">ACTIVE (Sedang Berjalan)</option>
            <option value="PAUSED">PAUSED (Dijeda)</option>
            <option value="COMPLETED">COMPLETED (Selesai)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Gagal memuat daftar sesi perjalanan." onRetry={refetch} />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Tidak Ada Sesi Perjalanan"
            description="Belum ada wisatawan yang memulai sesi perjalanan wisata sesuai filter pencarian."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wisatawan</TableHead>
                <TableHead>Itinerary Lombok</TableHead>
                <TableHead onClick={() => handleSort('startedAt')} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Mulai Perjalanan
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progres Aktivitas</TableHead>
                <TableHead>Jarak Tempuh</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                        {item.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{item.userName}</div>
                        <div className="text-[11px] text-slate-500">{item.userEmail}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-xs text-slate-800 max-w-[200px] truncate">
                      {item.itineraryTitle}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-slate-600">{formatDateTime(item.startedAt)}</div>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {item.completedActivitiesCount} / {item.totalActivitiesCount}
                      </span>
                      <span className="text-[10px] text-slate-400">destinasi</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-slate-700">
                      {(item.totalDistanceMeters / 1000).toFixed(1)} km
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedSessionId(item.id);
                        setDetailModalOpen(true);
                      }}
                      className="h-8 text-xs text-emerald-600 hover:text-emerald-700 gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex justify-end">
            <Pagination
              meta={meta}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <TripSessionDetailModal
        sessionId={selectedSessionId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
