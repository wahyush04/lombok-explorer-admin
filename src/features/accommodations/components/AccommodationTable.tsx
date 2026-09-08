import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accommodationApi } from '../api/accommodation.api';
import { Accommodation, AccommodationFilters, AccommodationStatus } from '@/types/accommodation.types';
import { REGIONS } from '@/types/common.types';
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
  Star,
  Hotel,
  ArrowUpDown,
} from 'lucide-react';

interface AccommodationTableProps {
  onAdd: () => void;
  onView: (acc: Accommodation) => void;
  onEdit: (acc: Accommodation) => void;
}

export function AccommodationTable({ onAdd, onView, onEdit }: AccommodationTableProps) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AccommodationFilters>({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    region: undefined,
    status: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  });

  const [deleteTarget, setDeleteTarget] = useState<Accommodation | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['accommodations', filters],
    queryFn: async () => {
      const res = await accommodationApi.getAccommodations(filters);
      return res;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return accommodationApi.deleteAccommodation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
  });

  const quickStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AccommodationStatus }) => {
      return accommodationApi.updateAccommodationStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] });
    },
  });

  const accommodations = data?.data || [];
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
          placeholder="Cari hotel, villa, homestay..."
          className="w-full lg:w-72"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.region || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                region: (e.target.value as AccommodationFilters['region']) || undefined,
                page: 1,
              }))
            }
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Wilayah</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as AccommodationStatus) || undefined,
                page: 1,
              }))
            }
            className="w-32 h-9 text-xs"
          >
            <option value="">Semua Status</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </Select>

          <Button onClick={onAdd} size="sm" className="h-9 text-xs font-semibold">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Akomodasi
          </Button>
        </div>
      </div>

      {/* Table Content */}
      {isError ? (
        <ErrorState message="Gagal memuat data penginapan." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : accommodations.length === 0 ? (
        <EmptyState
          title="Tidak ada akomodasi ditemukan"
          description="Coba ubah kata kunci pencarian atau sesuaikan filter wilayah."
          actionText="Tambah Akomodasi Baru"
          onAction={onAdd}
          icon={<Hotel className="h-7 w-7" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort('name')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Akomodasi</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Wilayah</TableHead>
                <TableHead
                  onClick={() => handleSort('pricePerNight')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tarif / Malam</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('rating')}
                  className="cursor-pointer hover:text-slate-900 select-none text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Rating</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accommodations.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={acc.coverImageUrl || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'}
                        alt={acc.name}
                        className="h-10 w-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-xs text-slate-900 truncate block">
                            {acc.name}
                          </span>
                          {acc.isFeatured && (
                            <Badge variant="default" className="text-[9px] py-0 px-1 bg-amber-500">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {acc.address}
                        </span>
                        {(acc.missingLocales?.includes('en-US') ||
                          (Array.isArray(acc.translations) && !acc.translations.some((t) => t.locale === 'en-US'))) && (
                          <span className="text-[10px] text-amber-600 block mt-0.5">
                            • English missing
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700 font-medium">{acc.type}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">
                      {acc.region ? acc.region.replace(/_/g, ' ') : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-900">
                      {formatCurrency(acc.pricePerNight)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-600">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{acc.rating ? acc.rating.toFixed(1) : '-'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({acc.reviewCount})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1.5">
                      <StatusBadge status={acc.status} />
                      <select
                        value={acc.status}
                        onChange={(e) =>
                          quickStatusMutation.mutate({
                            id: acc.id,
                            status: e.target.value as AccommodationStatus,
                          })
                        }
                        className="text-[10px] text-slate-500 bg-transparent border-0 cursor-pointer hover:text-slate-800 focus:outline-none"
                      >
                        <option value="PUBLISHED">Publik</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Arsip</option>
                      </select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(acc)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        title="Lihat Detail"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(acc)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-700"
                        title="Edit Akomodasi"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(acc)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Hapus Akomodasi"
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
        title="Hapus Data Akomodasi?"
        description={`Apakah Anda yakin ingin menghapus akomodasi "${deleteTarget?.name}"?`}
        confirmText="Hapus Akomodasi"
        cancelText="Batal"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
