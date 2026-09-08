import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/category.api';
import { Category } from '@/types/category.types';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Eye, Edit2, Trash2, Waves, Mountain, Landmark, Droplets, Sun, Compass, FolderTree } from 'lucide-react';
import { CategoryDetailModal } from './CategoryDetailModal';

interface CategoryTableProps {
  onAdd: () => void;
  onEdit: (cat: Category) => void;
}

export function CategoryTable({ onAdd, onEdit }: CategoryTableProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Delete & Reassign Dialog
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [categoryToView, setCategoryToView] = useState<Category | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories', { search, page }],
    queryFn: async () => {
      const res = await categoryApi.getCategories({ search, page, limit: 10 });
      return res;
    },
  });

  const categories = data?.data || [];
  const meta = data?.meta;

  const deleteMutation = useMutation({
    mutationFn: async ({ id, reassignTo }: { id: string; reassignTo?: string }) => {
      return categoryApi.deleteCategory(id, reassignTo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setCategoryToDelete(null);
      setReassignTargetId('');
      setDeleteErrorMessage(null);
    },
    onError: (err: { message?: string }) => {
      setDeleteErrorMessage(err.message || 'Gagal menghapus kategori.');
    },
  });

  const renderIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'mountain':
        return <Mountain className="h-4 w-4 text-emerald-600" />;
      case 'landmark':
        return <Landmark className="h-4 w-4 text-amber-600" />;
      case 'droplets':
        return <Droplets className="h-4 w-4 text-blue-600" />;
      case 'sun':
        return <Sun className="h-4 w-4 text-yellow-600" />;
      case 'compass':
        return <Compass className="h-4 w-4 text-teal-600" />;
      default:
        return <Waves className="h-4 w-4 text-cyan-600" />;
    }
  };

  const otherCategories = categories.filter((c) => c.id !== categoryToDelete?.id);

  return (
    <div className="space-y-4">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari kategori pariwisata..."
          className="w-full sm:w-80"
        />

        <Button onClick={onAdd} size="sm" className="h-9 text-xs font-semibold">
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Kategori
        </Button>
      </div>

      {/* Table Content */}
      {isError ? (
        <ErrorState message="Gagal memuat kategori wisata." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="Tidak ada kategori"
          description="Belum ada kategori yang cocok dengan pencarian."
          actionText="Buat Kategori Pertama"
          onAction={onAdd}
          icon={<FolderTree className="h-7 w-7" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Ikon</TableHead>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Jumlah Destinasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-center">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mx-auto">
                      {renderIcon(cat.iconName)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {cat.coverImageUrl && (
                        <img
                          src={cat.coverImageUrl}
                          alt={cat.name}
                          className="h-9 w-12 rounded object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {cat.description}
                        </span>
                        {/* Missing translation indicator */}
                        {(cat.missingLocales?.includes('en-US') ||
                          (Array.isArray(cat.translations) && !cat.translations.some((t) => t.locale === 'en-US'))) && (
                          <span className="text-[10px] text-amber-600 block mt-0.5">
                            • English missing
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-600">{cat.slug}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {cat.destinationsCount ?? 0} destinasi
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={cat.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCategoryToView(cat)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-700"
                        title="Lihat Detail & Terjemahan"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(cat)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-700"
                        title="Edit Kategori"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteErrorMessage(null);
                          setCategoryToDelete(cat);
                          setReassignTargetId(otherCategories[0]?.id || '');
                        }}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Hapus Kategori"
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
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Delete / Conflict Resolution Dialog */}
      {categoryToDelete && (
        <Dialog open={Boolean(categoryToDelete)} onOpenChange={(open) => !open && setCategoryToDelete(null)} maxWidth="sm">
          <DialogHeader>
            <DialogTitle>Hapus Kategori "{categoryToDelete.name}"?</DialogTitle>
            <DialogDescription>
              {categoryToDelete.destinationsCount && categoryToDelete.destinationsCount > 0 ? (
                <span>
                  Kategori ini memiliki <strong>{categoryToDelete.destinationsCount} destinasi aktif</strong>.
                  Pilih kategori tujuan pemindahan agar data destinasi tidak terhapus.
                </span>
              ) : (
                'Apakah Anda yakin ingin menghapus kategori ini secara permanen?'
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteErrorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {deleteErrorMessage}
            </div>
          )}

          {categoryToDelete.destinationsCount && categoryToDelete.destinationsCount > 0 && (
            <div className="py-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alihkan Destinasi ke Kategori Berikut:
              </label>
              <Select
                value={reassignTargetId}
                onChange={(e) => setReassignTargetId(e.target.value)}
              >
                {otherCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteMutation.mutate({
                  id: categoryToDelete.id,
                  reassignTo: categoryToDelete.destinationsCount ? reassignTargetId : undefined,
                })
              }
              isLoading={deleteMutation.isPending}
            >
              Hapus Kategori
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Detail & Translations Modal */}
      <CategoryDetailModal
        open={Boolean(categoryToView)}
        onOpenChange={(open) => {
          if (!open) setCategoryToView(null);
        }}
        category={categoryToView}
        onEdit={(cat) => {
          setCategoryToView(null);
          onEdit(cat);
        }}
      />
    </div>
  );
}
