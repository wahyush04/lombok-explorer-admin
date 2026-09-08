import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '../api/restaurant.api';
import { Restaurant, RestaurantFilters, RestaurantStatus } from '@/types/restaurant.types';
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
  UtensilsCrossed,
  CheckCircle2,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';

interface RestaurantTableProps {
  onAdd: () => void;
  onView: (rest: Restaurant) => void;
  onEdit: (rest: Restaurant) => void;
  onManageGallery?: (rest: Restaurant) => void;
}

export function RestaurantTable({ onAdd, onView, onEdit, onManageGallery }: RestaurantTableProps) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<RestaurantFilters>({
    page: 1,
    limit: 10,
    search: '',
    cuisineType: '',
    region: undefined,
    status: undefined,
    isHalalCertified: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  });

  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurants', filters],
    queryFn: async () => {
      const res = await restaurantApi.getRestaurants(filters);
      return res;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return restaurantApi.deleteRestaurant(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
  });

  const quickStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RestaurantStatus }) => {
      return restaurantApi.updateRestaurantStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  const restaurants = data?.data || [];
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
      {/* Filter and Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
          placeholder="Cari restoran, menu andalan..."
          className="w-full lg:w-72"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.region || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                region: (e.target.value as RestaurantFilters['region']) || undefined,
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
                status: (e.target.value as RestaurantStatus) || undefined,
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
            Tambah Restoran
          </Button>
        </div>
      </div>

      {/* Table Content */}
      {isError ? (
        <ErrorState message="Gagal memuat data restoran." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          title="Tidak ada restoran ditemukan"
          description="Coba ubah kata kunci pencarian atau sesuaikan filter wilayah."
          actionText="Tambah Restoran Baru"
          onAction={onAdd}
          icon={<UtensilsCrossed className="h-7 w-7" />}
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
                    <span>Restoran / Kuliner</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Jenis Masakan</TableHead>
                <TableHead>Menu Spesial</TableHead>
                <TableHead>Wilayah</TableHead>
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
              {restaurants.map((rest) => (
                <TableRow key={rest.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={rest.coverImageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947'}
                        alt={rest.name}
                        className="h-10 w-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-xs text-slate-900 truncate block">
                            {rest.name}
                          </span>
                          {rest.isHalalCertified && (
                            <Badge variant="success" className="text-[9px] py-0 px-1">
                              Halal
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {rest.address}
                        </span>
                        {(rest.missingLocales?.includes('en-US') ||
                          (Array.isArray(rest.translations) && !rest.translations.some((t) => t.locale === 'en-US'))) && (
                          <span className="text-[10px] text-amber-600 block mt-0.5">
                            • English missing
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700 font-medium">{rest.cuisineType}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-emerald-800 font-medium truncate block max-w-[160px]">
                      {rest.specialtyDish}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">
                      {rest.region ? rest.region.replace(/_/g, ' ') : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-600">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{rest.rating ? rest.rating.toFixed(1) : '-'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({rest.reviewCount})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1.5">
                      <StatusBadge status={rest.status} />
                      <select
                        value={rest.status}
                        onChange={(e) =>
                          quickStatusMutation.mutate({
                            id: rest.id,
                            status: e.target.value as RestaurantStatus,
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
                        onClick={() => onView(rest)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        title="Lihat Detail"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {onManageGallery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onManageGallery(rest)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
                          title="Kelola Galeri Foto"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(rest)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-700"
                        title="Edit Restoran"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(rest)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Hapus Restoran"
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
        title="Hapus Data Restoran?"
        description={`Apakah Anda yakin ingin menghapus data restoran "${deleteTarget?.name}"?`}
        confirmText="Hapus Restoran"
        cancelText="Batal"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
