import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { NotificationComposerModal } from './NotificationComposerModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { formatDateTime } from '@/lib/utils/format';
import {
  Bell,
  Send,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react';

export function NotificationView() {
  const [composerOpen, setComposerOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const res = await notificationApi.getStats();
      return res.data;
    },
  });

  const devices = data?.devices;
  const broadcasts = data?.recentBroadcasts || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Dispatch CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl text-white shadow-xs gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold">Pusat Siaran Notifikasi Wisatawan</h3>
          </div>
          <p className="text-xs text-emerald-100 max-w-xl">
            Sampaikan pengumuman penting, info cuaca ekstrem, festival Sasak, atau promo destinasi langsung ke perangkat turis melalui Firebase Cloud Messaging.
          </p>
        </div>

        <Button
          onClick={() => setComposerOpen(true)}
          className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs gap-1.5 shrink-0 shadow-md"
        >
          <Send className="h-3.5 w-3.5 text-emerald-700" />
          Kirim Notifikasi Baru
        </Button>
      </div>

      {/* Device Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 block mb-1">Total Token Aktif</span>
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? <Skeleton className="h-8 w-16" /> : devices?.totalActive || 0}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Perangkat Siap Terima Pesan</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 block mb-1">Pengguna Android</span>
            <div className="text-2xl font-bold text-emerald-700">
              {isLoading ? <Skeleton className="h-8 w-16" /> : devices?.android || 0}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Aplikasi Android FCM</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 block mb-1">Pengguna iOS</span>
            <div className="text-2xl font-bold text-blue-700">
              {isLoading ? <Skeleton className="h-8 w-16" /> : devices?.ios || 0}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Apple APNs Gateway</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 block mb-1">Pengguna Web</span>
            <div className="text-2xl font-bold text-indigo-700">
              {isLoading ? <Skeleton className="h-8 w-16" /> : devices?.web || 0}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Browser Web Push</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Broadcasts History */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Histori Siaran Pengumuman Terakhir
            </h4>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Gagal memuat histori siaran notifikasi." onRetry={refetch} />
        ) : broadcasts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada siaran notifikasi yang dikirimkan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Notifikasi</TableHead>
                <TableHead>Target Platform</TableHead>
                <TableHead>Keterkiriman</TableHead>
                <TableHead>Pengirim</TableHead>
                <TableHead className="text-right">Waktu Kirim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <span className="font-semibold text-xs text-slate-900">{b.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {b.targetPlatform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {b.sentCount} terkirim
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">{b.sentBy}</span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-500">
                    {formatDateTime(b.sentAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Composer Modal */}
      <NotificationComposerModal
        open={composerOpen}
        onOpenChange={setComposerOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
