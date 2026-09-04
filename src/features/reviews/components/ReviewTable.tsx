import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api/review.api';
import { Review, ReviewFilters, ReviewStatus, ReviewTargetType } from '@/types/review.types';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils/format';
import {
  MessageSquare,
  Star,
  Check,
  X,
  Trash2,
  Image as ImageIcon,
  ArrowUpDown,
  AlertTriangle,
} from 'lucide-react';

export function ReviewTable() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 10,
    search: '',
    targetType: undefined,
    status: undefined,
    rating: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  });

  // Moderation Dialog
  const [reviewToModerate, setReviewToModerate] = useState<Review | null>(null);
  const [moderationAction, setModerationAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reviews', filters],
    queryFn: async () => {
      const res = await reviewApi.getReviews(filters);
      return res;
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: ReviewStatus; reason?: string }) => {
      return reviewApi.moderateReview(id, { status, rejectionReason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setReviewToModerate(null);
      setRejectionReason('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return reviewApi.deleteReview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
  });

  const reviews = data?.data || [];
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
          placeholder="Cari isi ulasan atau nama reviewer..."
          className="w-full lg:w-72"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.targetType || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                targetType: (e.target.value as ReviewTargetType) || undefined,
                page: 1,
              }))
            }
            className="w-40 h-9 text-xs"
          >
            <option value="">Semua Tipe Target</option>
            <option value="DESTINATION">Destinasi</option>
            <option value="RESTAURANT">Restoran</option>
            <option value="ACCOMMODATION">Akomodasi</option>
          </Select>

          <Select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as ReviewStatus) || undefined,
                page: 1,
              }))
            }
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">PENDING (Menunggu)</option>
            <option value="APPROVED">APPROVED (Disetujui)</option>
            <option value="REJECTED">REJECTED (Ditolak)</option>
          </Select>

          <Select
            value={filters.rating || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                rating: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
            className="w-28 h-9 text-xs"
          >
            <option value="">Semua Bintang</option>
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
            <option value="2">⭐⭐ (2)</option>
            <option value="1">⭐ (1)</option>
          </Select>
        </div>
      </div>

      {/* Reviews Table */}
      {isError ? (
        <ErrorState message="Gagal memuat daftar ulasan." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="Tidak ada ulasan ditemukan"
          description="Ulasan dari wisatawan akan ditampilkan di sini untuk dimoderasi."
          icon={<MessageSquare className="h-7 w-7" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reviewer & Target</TableHead>
                <TableHead
                  onClick={() => handleSort('rating')}
                  className="cursor-pointer hover:text-slate-900 select-none text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Rating</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Isi Ulasan</TableHead>
                <TableHead>Status Moderasi</TableHead>
                <TableHead
                  onClick={() => handleSort('createdAt')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tanggal</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Aksi Moderasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((rev) => (
                <TableRow key={rev.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                          {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold text-xs text-slate-900">
                          {rev.userName || 'Wisatawan Anonim'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Target: <span className="font-medium text-slate-700">{rev.targetName}</span>{' '}
                        <span className="text-[10px] text-slate-400">({rev.targetType})</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{rev.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs sm:max-w-md space-y-1.5">
                      <p className="text-xs text-slate-700 line-clamp-2">
                        "{rev.comment}"
                      </p>
                      {rev.photos && rev.photos.length > 0 && (
                        <div className="flex items-center space-x-1.5 pt-1">
                          {rev.photos.slice(0, 3).map((p, idx) => (
                            <img
                              key={idx}
                              src={p}
                              alt="Review attachment"
                              className="h-8 w-8 rounded object-cover border border-slate-200"
                            />
                          ))}
                          {rev.photos.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{rev.photos.length - 3} foto
                            </span>
                          )}
                        </div>
                      )}
                      {rev.rejectionReason && (
                        <div className="text-[10px] text-rose-600 font-medium flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Alasan ditolak: {rev.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={rev.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">{formatDateTime(rev.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {rev.status !== 'APPROVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReviewToModerate(rev);
                            setModerationAction('APPROVED');
                          }}
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2"
                          title="Setujui Ulasan"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Setujui
                        </Button>
                      )}
                      {rev.status !== 'REJECTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReviewToModerate(rev);
                            setModerationAction('REJECTED');
                            setRejectionReason('');
                          }}
                          className="h-7 text-xs text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2"
                          title="Tolak Ulasan"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Tolak
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(rev)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                        title="Hapus Ulasan"
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

      {/* Moderation Dialog */}
      {reviewToModerate && (
        <Dialog
          open={Boolean(reviewToModerate)}
          onOpenChange={(open) => !open && setReviewToModerate(null)}
          maxWidth="sm"
        >
          <DialogHeader>
            <DialogTitle>
              {moderationAction === 'APPROVED' ? 'Setujui Publikasi Ulasan' : 'Tolak Ulasan Komunitas'}
            </DialogTitle>
            <DialogDescription>
              Ulasan dari <strong>{reviewToModerate.userName}</strong> untuk{' '}
              <strong>{reviewToModerate.targetName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 italic">
              "{reviewToModerate.comment}"
            </div>

            {moderationAction === 'REJECTED' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Penolakan (Akan disimpan di log moderasi) *
                </label>
                <Input
                  placeholder="cth: Mengandung kata tidak pantas / promosi spam..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewToModerate(null)}
              disabled={moderateMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant={moderationAction === 'APPROVED' ? 'default' : 'destructive'}
              onClick={() =>
                moderateMutation.mutate({
                  id: reviewToModerate.id,
                  status: moderationAction,
                  reason: rejectionReason || undefined,
                })
              }
              isLoading={moderateMutation.isPending}
            >
              Konfirmasi {moderationAction === 'APPROVED' ? 'Setujui' : 'Tolak'}
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Ulasan?"
        description="Ulasan ini akan dihapus secara permanen dari basis data sistem."
        confirmText="Hapus Ulasan"
        cancelText="Batal"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
