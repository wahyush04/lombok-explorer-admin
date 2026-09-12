import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripSessionApi } from '../api/trip-session.api';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils/format';
import { MapPin, Navigation, Clock, CheckCircle2, CircleDot, User, Compass } from 'lucide-react';

interface TripSessionDetailModalProps {
  sessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripSessionDetailModal({ sessionId, open, onOpenChange }: TripSessionDetailModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['trip-session-detail', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const res = await tripSessionApi.getTripSessionById(sessionId);
      return res.data;
    },
    enabled: Boolean(sessionId && open),
  });

  const session = data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-emerald-600" />
          Detail Sesi Perjalanan Wisata
        </DialogTitle>
        <DialogDescription>
          Histori rute pelacakan, progres aktivitas destinasi, dan waktu kunjungan wisatawan di Lombok.
        </DialogDescription>
      </DialogHeader>

      {isLoading || !session ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* User & Status Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-slate-900">{session.user?.name}</div>
                <div className="text-slate-500">{session.user?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status Sesi:</span>
              <StatusBadge status={session.status} />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Waktu Dimulai</span>
              <span className="font-semibold text-slate-800">{formatDateTime(session.startedAt)}</span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Waktu Selesai</span>
              <span className="font-semibold text-slate-800">
                {session.endedAt ? formatDateTime(session.endedAt) : 'Masih Berlangsung'}
              </span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Jarak & Estimasi</span>
              <span className="font-semibold text-slate-800">
                {session.routes?.length || 0} Leg Rute Mapbox
              </span>
            </div>
          </div>

          {/* Activity Progress Timeline */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Progres Rencana Aktivitas ({session.itinerary?.title})
            </h4>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
              {session.activityProgress?.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">Belum ada progres aktivitas tercatat</div>
              ) : (
                session.activityProgress?.map((act, idx) => (
                  <div key={act.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">Aktivitas Wisata #{idx + 1}</span>
                        {act.arrivedAt && (
                          <span className="text-[10px] text-emerald-600 block">
                            Tiba: {formatDateTime(act.arrivedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {act.status === 'COMPLETED' && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] border-emerald-200">
                          Selesai
                        </Badge>
                      )}
                      {act.status === 'IN_PROGRESS' && (
                        <Badge className="bg-blue-100 text-blue-800 text-[10px] border-blue-200">
                          Sedang Menuju
                        </Badge>
                      )}
                      {act.status === 'SKIPPED' && (
                        <Badge className="bg-amber-100 text-amber-800 text-[10px] border-amber-200">
                          Dilewati
                        </Badge>
                      )}
                      {act.status === 'NOT_STARTED' && (
                        <Badge variant="outline" className="text-slate-500 text-[10px]">
                          Belum Mulai
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
