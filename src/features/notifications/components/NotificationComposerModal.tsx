import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { notificationApi } from '../api/notification.api';
import { AdminBroadcastNotificationRequest } from '@/types/notification.types';
import { REGIONS } from '@/types/common.types';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Bell, Send, Smartphone, Sparkles, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificationComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NotificationComposerModal({ open, onOpenChange, onSuccess }: NotificationComposerModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminBroadcastNotificationRequest>({
    defaultValues: {
      title: '',
      body: '',
      targetPlatform: 'ALL',
      targetRegion: undefined,
      imageUrl: '',
      deepLink: '',
      notificationType: 'ANNOUNCEMENT',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AdminBroadcastNotificationRequest) => {
      const payload: AdminBroadcastNotificationRequest = {
        ...data,
        targetRegion: data.targetRegion || undefined,
        imageUrl: data.imageUrl || undefined,
        deepLink: data.deepLink || undefined,
      };
      return notificationApi.sendBroadcast(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data: AdminBroadcastNotificationRequest) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-600" />
          Kirim Notifikasi Broadcast (FCM)
        </DialogTitle>
        <DialogDescription>
          Kirimkan pesan pengumuman wisata, cuaca ekstrem, festival budaya, atau informasi penting secara instan ke ponsel turis.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Judul Notifikasi *
          </label>
          <Input
            placeholder="cth: Peringatan Gelombang Tinggi Penyeberangan Gili"
            {...register('title', { required: 'Judul wajib diisi', minLength: { value: 3, message: 'Minimal 3 karakter' } })}
            error={errors.title?.message}
          />
        </div>

        {/* Message Body */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Isi Pesan Notifikasi *
          </label>
          <Textarea
            rows={3}
            placeholder="Tulis pesan lengkap yang akan tampil pada banner notifikasi ponsel pengguna..."
            {...register('body', { required: 'Isi pesan wajib diisi', minLength: { value: 5, message: 'Minimal 5 karakter' } })}
            error={errors.body?.message}
          />
        </div>

        {/* Targeting Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Platform Perangkat
            </label>
            <Select {...register('targetPlatform')}>
              <option value="ALL">Semua Platform (Android & iOS)</option>
              <option value="ANDROID">Hanya Android</option>
              <option value="IOS">Hanya iOS</option>
              <option value="WEB">Hanya Web Portal</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Filter Wilayah Turis (Opsional)
            </label>
            <Select {...register('targetRegion')}>
              <option value="">Semua Wilayah Lombok</option>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Deep link & Image URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tautan Layar Cepat (Deep Link Opsional)
            </label>
            <Input
              placeholder="cth: /destinations/pantai-kuta-mandalika"
              {...register('deepLink')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Banner Gambar (Opsional)
            </label>
            <Input
              placeholder="https://res.cloudinary.com/..."
              {...register('imageUrl')}
            />
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <Send className="h-4 w-4" />
            Kirim Broadcast Sekarang
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
