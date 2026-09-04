import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itinerarySchema, ItineraryFormData } from '../schemas/itinerary.schema';
import { itineraryApi } from '../api/itinerary.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ItineraryTemplate, ItineraryDay } from '@/types/itinerary.types';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface ItineraryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itineraryToEdit?: ItineraryTemplate | null;
  onSuccess: () => void;
}

export function ItineraryFormModal({
  open,
  onOpenChange,
  itineraryToEdit,
  onSuccess,
}: ItineraryFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(itineraryToEdit);

  const [days, setDays] = useState<ItineraryDay[]>([
    {
      dayNumber: 1,
      title: 'Hari 1: Eksplorasi Pantai Selatan',
      description: 'Menikmati keindahan pasir merica dan bukit Merese',
      activities: [
        { time: '09:00', title: 'Tiba di Pantai Tanjung Aan', description: 'Foto dan santai kelapa muda' },
        { time: '16:00', title: 'Sunset di Bukit Merese', description: 'Menikmati pemandangan laut dari atas tebing' },
      ],
    },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItineraryFormData>({
    resolver: zodResolver(itinerarySchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      durationDays: 3,
      estimatedCost: 1500000,
      currency: 'IDR',
      coverImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
      tags: ['Wisata Alam', 'Pantai', 'Keluarga'],
      status: 'PUBLISHED',
      isFeatured: false,
      days: [],
    },
  });

  useEffect(() => {
    if (itineraryToEdit) {
      reset({
        title: itineraryToEdit.title,
        slug: itineraryToEdit.slug,
        description: itineraryToEdit.description,
        durationDays: itineraryToEdit.durationDays,
        estimatedCost: itineraryToEdit.estimatedCost || 1500000,
        currency: itineraryToEdit.currency || 'IDR',
        coverImageUrl: itineraryToEdit.coverImageUrl,
        tags: itineraryToEdit.tags || [],
        status: itineraryToEdit.status,
        isFeatured: itineraryToEdit.isFeatured,
        days: itineraryToEdit.days || [],
      });
      if (itineraryToEdit.days && itineraryToEdit.days.length > 0) {
        setDays(itineraryToEdit.days);
      }
    } else {
      reset({
        title: '',
        slug: '',
        description: '',
        durationDays: 3,
        estimatedCost: 1500000,
        currency: 'IDR',
        coverImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
        tags: ['Wisata Bahari', 'Petualangan'],
        status: 'PUBLISHED',
        isFeatured: false,
        days: [],
      });
      setDays([
        {
          dayNumber: 1,
          title: 'Hari 1: Pantai Selatan & Sunset Merese',
          description: 'Eksplorasi garis pantai pasir merica',
          activities: [
            { time: '09:00', title: 'Pantai Tanjung Aan', description: 'Berenang dan bersantai' },
            { time: '16:30', title: 'Sunset Bukit Merese', description: 'Panorama matahari terbenam' },
          ],
        },
      ]);
    }
  }, [itineraryToEdit, reset]);

  const addDay = () => {
    const nextDayNum = days.length + 1;
    setDays((prev) => [
      ...prev,
      {
        dayNumber: nextDayNum,
        title: `Hari ${nextDayNum}: Eksplorasi Lanjutan`,
        description: '',
        activities: [{ time: '09:00', title: 'Aktivitas Pagi', description: '' }],
      },
    ]);
  };

  const removeDay = (idx: number) => {
    setDays((prev) => prev.filter((_, i) => i !== idx));
  };

  const mutation = useMutation({
    mutationFn: async (data: ItineraryFormData) => {
      const payload = { ...data, days };
      if (isEdit && itineraryToEdit) {
        return itineraryApi.updateItinerary(itineraryToEdit.id, payload);
      } else {
        return itineraryApi.createItinerary(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const isFeaturedValue = watch('isFeatured');

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Template Rencana Perjalanan' : 'Buat Template Itinerary Baru'}</DialogTitle>
        <DialogDescription>
          Rangkaian paket rekomendasi jadwal kunjungan wisata per hari bagi wisatawan Lombok.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Itinerary *</label>
            <Input placeholder="cth: 3D2N Pesona Lombok Eksotis" error={errors.title?.message} {...register('title')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL (Opsional)</label>
            <Input placeholder="3d2n-pesona-lombok-eksotis" error={errors.slug?.message} {...register('slug')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Rencana Perjalanan *</label>
          <Textarea
            rows={2}
            placeholder="Ringkasan pengalaman, rute perjalanan, kecocokan tipe wisatawan..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi Hari (Hari) *</label>
            <Input type="number" placeholder="3" error={errors.durationDays?.message} {...register('durationDays')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Biaya Total (IDR)</label>
            <Input type="number" placeholder="1500000" error={errors.estimatedCost?.message} {...register('estimatedCost')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Publikasi</label>
            <Select {...register('status')}>
              <option value="PUBLISHED">PUBLISHED (Aktif)</option>
              <option value="DRAFT">DRAFT (Konsep)</option>
              <option value="ARCHIVED">ARCHIVED (Arsip)</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">URL Gambar Sampul Itinerary *</label>
          <Input placeholder="https://images.unsplash.com/..." error={errors.coverImageUrl?.message} {...register('coverImageUrl')} />
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="isFeaturedItin"
            checked={isFeaturedValue}
            onCheckedChange={(checked) => setValue('isFeatured', checked)}
          />
          <label htmlFor="isFeaturedItin" className="text-xs font-medium text-slate-700 cursor-pointer">
            Jadikan Template Unggulan di Beranda Aplikasi (Featured)
          </label>
        </div>

        {/* Dynamic Days Builder */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span>Jadwal Harian ({days.length} Hari)</span>
            </h4>
            <Button type="button" size="sm" variant="outline" onClick={addDay} className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Tambah Hari
            </Button>
          </div>

          <div className="space-y-3">
            {days.map((d, dIdx) => (
              <div key={dIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Hari #{d.dayNumber}</span>
                  {days.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDay(dIdx)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder={`Judul Hari ${d.dayNumber}`}
                  value={d.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDays((prev) =>
                      prev.map((item, i) => (i === dIdx ? { ...item, title: val } : item))
                    );
                  }}
                  className="text-xs"
                />
                <Input
                  placeholder="Ringkasan aktivitas hari ini..."
                  value={d.description || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDays((prev) =>
                      prev.map((item, i) => (i === dIdx ? { ...item, description: val } : item))
                    );
                  }}
                  className="text-xs bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Simpan Perubahan' : 'Simpan Template'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
