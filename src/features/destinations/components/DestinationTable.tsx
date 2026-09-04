import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { destinationApi } from '../api/destination.api';
import { categoryApi } from '@/features/categories/api/category.api';
import { Destination, DestinationFilters, DestinationStatus } from '@/types/destination.types';
import { REGIONS } from '@/types/common.types';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
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
  Image as ImageIcon,
  Star,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  CheckSquare,
} from 'lucide-react';

interface DestinationTableProps {
  onAdd: () => void;
  onView: (dst: Destination) => void;
  onEdit: (dst: Destination) => void;
  onManageGallery: (dst: Destination) => void;
}

export function DestinationTable({
  onAdd,
  onView,
  onEdit,
  onManageGallery,
}: DestinationTableProps) {
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<DestinationFilters>({
    page: 1,
    limit: 10,
    search: '',
    categoryId: '',
    region: undefined,
    status: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  });

  // Selected IDs for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog States
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkStatusTarget, setBulkStatusTarget] = useState<DestinationStatus | null>(null);

  // Fetch Categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const res = await categoryApi.getCategories({ limit: 100 });
      return res.data;
    },
  });

  // Fetch Destinations List
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['destinations', filters],
    queryFn: async () => {
      const res = await destinationApi.getDestinations(filters);
      return res;
    },
  });

  // Single Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return destinationApi.deleteDestination(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
  });

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return destinationApi.bulkDeleteDestinations({ ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    },
  });

  // Bulk Status Update Mutation
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: DestinationStatus }) => {
      return destinationApi.bulkUpdateDestinationStatus({ ids, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      setSelectedIds([]);
      setBulkStatusTarget(null);
    },
  });

  // Quick Single Status Toggle
  const quickStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DestinationStatus }) => {
      return destinationApi.updateDestinationStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
  });

  const destinations = data?.data || [];
  const meta = data?.meta;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(destinations.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const isAllSelected = destinations.length > 0 && selectedIds.length === destinations.length;

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
      {/* Action and Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Search Input */}
        <SearchInput
          value={filters.search || ''}
          onChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
          placeholder="Cari destinasi atau lokasi..."
          className="w-full lg:w-72"
        />

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <Select
            value={filters.categoryId || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value, page: 1 }))}
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Kategori</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>

          {/* Region Filter */}
          <Select
            value={filters.region || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                region: (e.target.value as DestinationFilters['region']) || undefined,
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

          {/* Status Filter */}
          <Select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as DestinationStatus) || undefined,
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

          {/* Add Destination CTA */}
          <Button onClick={onAdd} size="sm" className="h-9 text-xs font-semibold">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Destinasi
          </Button>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-900">
            <CheckSquare className="h-4 w-4 text-emerald-600" />
            <span>{selectedIds.length} destinasi dipilih</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: 'PUBLISHED' })}
              isLoading={bulkStatusMutation.isPending}
              className="h-7 text-xs bg-white text-emerald-700 hover:bg-emerald-100"
            >
              Set Publikasi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: 'DRAFT' })}
              isLoading={bulkStatusMutation.isPending}
              className="h-7 text-xs bg-white text-amber-700 hover:bg-amber-100"
            >
              Set Draft
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="h-7 text-xs"
            >
              Hapus Terpilih
            </Button>
          </div>
        </div>
      )}

      {/* Content Table */}
      {isError ? (
        <ErrorState message="Gagal mengambil data destinasi." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <EmptyState
          title="Tidak ada destinasi ditemukan"
          description="Coba ubah kata kunci pencarian atau sesuaikan filter wilayah dan kategori."
          actionText="Tambah Destinasi Baru"
          onAction={onAdd}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Pilih Semua"
                  />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('name')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Destinasi</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Wilayah</TableHead>
                <TableHead
                  onClick={() => handleSort('ticketPrice')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tiket Masuk</span>
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
              {destinations.map((dst) => {
                const isSelected = selectedIds.includes(dst.id);
                return (
                  <TableRow key={dst.id} data-state={isSelected ? 'selected' : undefined}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectOne(dst.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={dst.coverImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62'}
                          alt={dst.name}
                          className="h-10 w-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-xs text-slate-900 truncate block">
                              {dst.name}
                            </span>
                            {dst.isFeatured && (
                              <Badge variant="default" className="text-[9px] py-0 px-1 bg-amber-500">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {dst.locationName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700 font-medium">
                        {dst.categoryName || 'Wisata'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">
                        {dst.region ? dst.region.replace(/_/g, ' ') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">
                        {dst.ticketPrice || dst.entranceFee
                          ? formatCurrency(dst.ticketPrice || dst.entranceFee || 0)
                          : 'Gratis'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{dst.rating ? dst.rating.toFixed(1) : '-'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({dst.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1.5">
                        <StatusBadge status={dst.status} />
                        <select
                          value={dst.status}
                          onChange={(e) =>
                            quickStatusMutation.mutate({
                              id: dst.id,
                              status: e.target.value as DestinationStatus,
                            })
                          }
                          className="text-[10px] text-slate-500 bg-transparent border-0 cursor-pointer hover:text-slate-800 focus:outline-none"
                          title="Ubah Status Cepat"
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
                          onClick={() => onView(dst)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                          title="Lihat Detail"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onManageGallery(dst)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-700"
                          title="Kelola Galeri Foto"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(dst)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-700"
                          title="Edit Destinasi"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(dst)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                          title="Hapus Destinasi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination
            meta={meta}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Single Delete Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Destinasi Wisata?"
        description={`Apakah Anda yakin ingin menghapus destinasi "${deleteTarget?.name}"? Tindakan ini dapat dipulihkan dari log sistem.`}
        confirmText="Hapus Destinasi"
        cancelText="Batal"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        title={`Hapus ${selectedIds.length} Destinasi?`}
        description="Semua destinasi yang dipilih akan dihapus secara bersamaan dari katalog pariwisata."
        confirmText="Hapus Semua Terpilih"
        cancelText="Batal"
        isDestructive
        isLoading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
      />
    </div>
  );
}
