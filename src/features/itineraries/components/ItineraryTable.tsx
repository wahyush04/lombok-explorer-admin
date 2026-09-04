import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itineraryApi } from '../api/itinerary.api';
import { ItineraryTemplate, ItineraryFilters, ItineraryStatus } from '@/types/itinerary.types';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/format';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  ArrowUpDown,
  Compass,
} from 'lucide-react';

interface ItineraryTableProps {
  onAdd: () => void;
  onView: (itn: ItineraryTemplate) => void;
  onEdit: (itn: ItineraryTemplate) => void;
}

export function ItineraryTable({ onAdd, onView, onEdit }: ItineraryTableProps) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ItineraryFilters>({
    page: 1,
    limit: 10,
    search: '',
    durationDays: undefined,
    status: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  });

  const [deleteTarget, setDeleteTarget] = useState<ItineraryTemplate | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['itineraries', filters],
    queryFn: async () => {
      const res = await itineraryApi.getItineraries(filters);
      return res;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return itineraryApi.deleteItinerary(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
  });

  const itineraries = data?.data || [];
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
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
          placeholder="Cari judul template itinerary..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center space-x-2">
          <Select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as ItineraryStatus) || undefined,
                page: 1,
              }))
            }
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Status</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </Select>

          <Button onClick={onAdd} size="sm" className="h-9 text-xs font-semibold">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Itinerary
          </Button>
        </div>
      </div>

      {/* Table Content */}
      {isError ? (
        <ErrorState message="Gagal memuat template itinerary." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : itineraries.length === 0 ? (
        <EmptyState
          title="Tidak ada template itinerary"
          description="Buat panduan dan rencana rute perjalanan terstruktur untuk wisatawan Lombok."
          actionText="Tambah Template Itinerary"
          onAction={onAdd}
          icon={<Compass className="h-7 w-7" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort('title')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Paket Itinerary</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Durasi Hari</TableHead>
                <TableHead>Estimasi Biaya</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itineraries.map((itn) => (
                <TableRow key={itn.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={itn.coverImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62'}
                        alt={itn.title}
                        className="h-10 w-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 max-w-[220px] sm:max-w-sm">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-xs text-slate-900 truncate block">
                            {itn.title}
                          </span>
                          {itn.isFeatured && (
                            <Badge variant="default" className="text-[9px] py-0 px-1 bg-amber-500">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {itn.description}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                      <Calendar className="h-3 w-3 mr-1" />
                      {itn.durationDays} Hari
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-900">
                      {formatCurrency(itn.estimatedCost || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={itn.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(itn)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        title="Lihat Detail"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(itn)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-700"
                        title="Edit Itinerary"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(itn)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Hapus Itinerary"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Template Itinerary?"
        description={`Apakah Anda yakin ingin menghapus template itinerary "${deleteTarget?.title}"?`}
        confirmText="Hapus Template"
        cancelText="Batal"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
