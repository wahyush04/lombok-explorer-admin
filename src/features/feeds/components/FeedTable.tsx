import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedApi } from '../api/feed.api';
import {
  AdminPostReportListItem,
  FeedReportFilters,
  ReportStatus,
  ReportReason,
  PostStatus,
} from '@/types/feed.types';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils/format';
import {
  Flag,
  CheckCircle2,
  XCircle,
  EyeOff,
  Clock,
  ArrowUpDown,
  User,
  FileText,
} from 'lucide-react';

export function FeedTable() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<FeedReportFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    reason: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  });

  // Report Resolution Dialog
  const [reportToResolve, setReportToResolve] = useState<AdminPostReportListItem | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<ReportStatus>('RESOLVED');
  const [adminNotes, setAdminNotes] = useState('');

  // Post Status Dialog
  const [postToModerate, setPostToModerate] = useState<{ id: string; title: string; currentStatus: string } | null>(null);
  const [newPostStatus, setNewPostStatus] = useState<PostStatus>('HIDDEN');
  const [postAdminNotes, setPostAdminNotes] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['feed-reports', filters],
    queryFn: async () => {
      const res = await feedApi.getReports(filters);
      return res;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ReportStatus; notes?: string }) => {
      return feedApi.resolveReport(id, { status, adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setReportToResolve(null);
      setAdminNotes('');
    },
  });

  const postStatusMutation = useMutation({
    mutationFn: async ({ postId, status, notes }: { postId: string; status: PostStatus; notes?: string }) => {
      return feedApi.updatePostStatus(postId, { status, adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setPostToModerate(null);
      setPostAdminNotes('');
    },
  });

  const reports = data?.data || [];
  const meta = data?.meta;

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      sortBy: field,
      order: prev.sortBy === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="warning" className="text-[11px] gap-1">
            <Clock className="h-3 w-3" /> Menunggu
          </Badge>
        );
      case 'REVIEWED':
        return (
          <Badge variant="secondary" className="text-[11px] gap-1">
            <Flag className="h-3 w-3 text-sky-600" /> Ditinjau
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge variant="success" className="text-[11px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Selesai
          </Badge>
        );
      case 'DISMISSED':
        return (
          <Badge variant="default" className="text-[11px] gap-1">
            <XCircle className="h-3 w-3" /> Ditolak
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getReasonBadge = (reason: ReportReason) => {
    const colorMap: Record<string, string> = {
      SPAM: 'bg-amber-50 text-amber-700 border-amber-200',
      INAPPROPRIATE: 'bg-rose-50 text-rose-700 border-rose-200',
      HARASSMENT: 'bg-red-50 text-red-700 border-red-200',
      FRAUD: 'bg-purple-50 text-purple-700 border-purple-200',
      MISLEADING: 'bg-orange-50 text-orange-700 border-orange-200',
      OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return (
      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${colorMap[reason] || colorMap.OTHER}`}>
        {reason}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
          placeholder="Cari deskripsi laporan atau nama pelapor..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center space-x-2">
          <Select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as ReportStatus) || undefined,
                page: 1,
              }))
            }
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">PENDING</option>
            <option value="REVIEWED">REVIEWED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="DISMISSED">DISMISSED</option>
          </Select>

          <Select
            value={filters.reason || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                reason: (e.target.value as ReportReason) || undefined,
                page: 1,
              }))
            }
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Alasan</option>
            <option value="SPAM">SPAM</option>
            <option value="INAPPROPRIATE">INAPPROPRIATE</option>
            <option value="HARASSMENT">HARASSMENT</option>
            <option value="FRAUD">FRAUD</option>
            <option value="MISLEADING">MISLEADING</option>
            <option value="OTHER">OTHER</option>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      {isError ? (
        <ErrorState message="Gagal memuat laporan konten feed komunitas dari backend." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="Tidak ada laporan konten feed"
          description="Saat ini tidak ada laporan pelanggaran konten yang diajukan oleh wisatawan komunitas."
          icon={<Flag className="h-7 w-7 text-emerald-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelapor</TableHead>
                <TableHead>Postingan Yang Dilaporkan</TableHead>
                <TableHead>Alasan & Rincian</TableHead>
                <TableHead>Status Laporan</TableHead>
                <TableHead
                  onClick={() => handleSort('createdAt')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tanggal Laporan</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Aksi Moderasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {report.reporter.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          @{report.reporter.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.post ? (
                      <div>
                        <span className="font-semibold text-xs text-slate-800 line-clamp-1">
                          {report.post.title || 'Untitled Post'}
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          {report.post.author && (
                            <span>Oleh: {report.post.author.name}</span>
                          )}
                          <Badge variant="default" className="text-[9px] px-1 py-0 h-3.5">
                            Status: {report.post.status}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Post #{report.postId}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getReasonBadge(report.reason)}
                      {report.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-1 max-w-xs">
                          {report.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">
                      {formatDateTime(report.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReportToResolve(report);
                          setResolutionStatus(report.status === 'PENDING' ? 'RESOLVED' : report.status);
                          setAdminNotes(report.adminNotes || '');
                        }}
                        className="h-7 text-xs px-2"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                        Resolusi
                      </Button>
                      {report.post && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPostToModerate({
                              id: report.post!.id,
                              title: report.post!.title,
                              currentStatus: report.post!.status,
                            });
                            setNewPostStatus(report.post!.status === 'HIDDEN' ? 'PUBLISHED' : 'HIDDEN');
                          }}
                          className="h-7 text-xs px-2 text-rose-700 hover:bg-rose-50"
                          title="Ubah visibilitas post"
                        >
                          <EyeOff className="h-3 w-3 mr-1" />
                          Post
                        </Button>
                      )}
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

      {/* Resolution Dialog */}
      {reportToResolve && (
        <Dialog
          open={Boolean(reportToResolve)}
          onOpenChange={(open) => !open && setReportToResolve(null)}
          maxWidth="sm"
        >
          <DialogHeader>
            <DialogTitle>Resolusi Laporan Konten</DialogTitle>
            <DialogDescription>
              Tentukan status penyelesaian laporan untuk post <strong>#{reportToResolve.postId}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Resolusi</label>
              <Select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as ReportStatus)}
              >
                <option value="RESOLVED">RESOLVED (Laporan Terbukti & Diselesaikan)</option>
                <option value="DISMISSED">DISMISSED (Laporan Ditolak / Tidak Terbukti)</option>
                <option value="REVIEWED">REVIEWED (Sedang Ditinjau)</option>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Tindakan Administrator</label>
              <Input
                placeholder="cth: Konten telah diperiksa dan disesuaikan..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportToResolve(null)}
              disabled={resolveMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={() =>
                resolveMutation.mutate({
                  id: reportToResolve.id,
                  status: resolutionStatus,
                  notes: adminNotes || undefined,
                })
              }
              isLoading={resolveMutation.isPending}
            >
              Simpan Resolusi
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Post Status Moderation Dialog */}
      {postToModerate && (
        <Dialog
          open={Boolean(postToModerate)}
          onOpenChange={(open) => !open && setPostToModerate(null)}
          maxWidth="sm"
        >
          <DialogHeader>
            <DialogTitle>Moderasi Status Post Feed</DialogTitle>
            <DialogDescription>
              Ubah status publikasi untuk postingan <strong>{postToModerate.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Publikasi Baru</label>
              <Select
                value={newPostStatus}
                onChange={(e) => setNewPostStatus(e.target.value as PostStatus)}
              >
                <option value="PUBLISHED">PUBLISHED (Tampilkan ke Publik)</option>
                <option value="HIDDEN">HIDDEN (Sembunyikan dari Publik)</option>
                <option value="DELETED">DELETED (Tandai Dihapus)</option>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Moderasi</label>
              <Input
                placeholder="Alasan perubahan visibilitas post..."
                value={postAdminNotes}
                onChange={(e) => setPostAdminNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPostToModerate(null)}
              disabled={postStatusMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant={newPostStatus === 'HIDDEN' || newPostStatus === 'DELETED' ? 'destructive' : 'default'}
              onClick={() =>
                postStatusMutation.mutate({
                  postId: postToModerate.id,
                  status: newPostStatus,
                  notes: postAdminNotes || undefined,
                })
              }
              isLoading={postStatusMutation.isPending}
            >
              Terapkan Status
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
