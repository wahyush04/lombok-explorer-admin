import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itinerarySchema, ItineraryFormData, buildItineraryTranslations } from '../schemas/itinerary.schema';
import { itineraryApi } from '../api/itinerary.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ItineraryTemplate, AdminTemplateDayInput } from '@/types/itinerary.types';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { ImageUploader } from '@/components/common/ImageUploader';
import { CloudinaryAsset } from '@/types/upload.types';
import { SupportedLocale } from '@/lib/constants/locales';
import { TranslationCompleteness, calculateTranslationStatus } from '@/types/localization.types';
import { TranslationEditor } from '@/components/localization/TranslationEditor';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { setBackendValidationErrors } from '@/lib/api/api-error';

interface ItineraryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itineraryToEdit?: (ItineraryTemplate & { translations?: any[] }) | null;
  onSuccess: () => void;
}

export function ItineraryFormModal({
  open,
  onOpenChange,
  itineraryToEdit,
  onSuccess,
}: ItineraryFormModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = Boolean(itineraryToEdit);
  const [isUploading, setIsUploading] = useState(false);
  const [days, setDays] = useState<AdminTemplateDayInput[]>([]);
  const [contentLocale, setContentLocale] = useState<SupportedLocale>('id-ID');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isDirty },
  } = useForm<ItineraryFormData>({
    resolver: zodResolver(itinerarySchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      transportPaceNote: '',
      en_title: '',
      en_description: '',
      en_transportPaceNote: '',
      durationDays: 3,
      estimatedCost: 1500000,
      currency: 'IDR',
      coverImage: null,
      coverImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
      tags: ['Wisata Alam', 'Pantai', 'Keluarga'],
      status: 'PUBLISHED',
      isFeatured: false,
      days: [],
    },
  });

  const watchedTitle = watch('title');
  const watchedEnTitle = watch('en_title');

  const statusMap = useMemo<Record<SupportedLocale, TranslationCompleteness>>(() => {
    const idStatus = calculateTranslationStatus(
      { locale: 'id-ID', title: watchedTitle },
      ['title']
    );

    const enHasAny = Boolean(watchedEnTitle && watchedEnTitle.trim());

    const enStatus = enHasAny
      ? calculateTranslationStatus(
          { locale: 'en-US', title: watchedEnTitle },
          ['title']
        )
      : { status: 'MISSING' as TranslationCompleteness };

    return {
      'id-ID': idStatus.status,
      'en-US': enStatus.status,
    };
  }, [watchedTitle, watchedEnTitle]);

  useEffect(() => {
    if (itineraryToEdit) {
      const enTrans = itineraryToEdit.translations?.find((tr: any) => tr.locale === 'en-US');

      reset({
        title: itineraryToEdit.title,
        slug: itineraryToEdit.slug,
        description: itineraryToEdit.description,
        transportPaceNote: itineraryToEdit.transportPaceNote || '',
        en_title: enTrans?.title || '',
        en_description: enTrans?.description || '',
        en_transportPaceNote: enTrans?.transportPaceNote || '',
        durationDays: itineraryToEdit.durationDays,
        estimatedCost: itineraryToEdit.estimatedCost || 1500000,
        currency: itineraryToEdit.currency || 'IDR',
        coverImage: itineraryToEdit.coverImageUrl
          ? {
              publicId: 'existing_cover',
              secureUrl: itineraryToEdit.coverImageUrl,
              resourceType: 'image',
              isPrimary: true,
              orderIndex: 0,
            }
          : null,
        coverImageUrl: itineraryToEdit.coverImageUrl,
        tags: itineraryToEdit.tags || [],
        status: itineraryToEdit.status,
        isFeatured: itineraryToEdit.isFeatured,
        days: itineraryToEdit.days || [],
      });
      if (itineraryToEdit.days && itineraryToEdit.days.length > 0) {
        setDays(itineraryToEdit.days);
      }
      setContentLocale('id-ID');
    } else {
      reset({
        title: '',
        slug: '',
        description: '',
        transportPaceNote: '',
        en_title: '',
        en_description: '',
        en_transportPaceNote: '',
        durationDays: 3,
        estimatedCost: 1500000,
        currency: 'IDR',
        coverImage: null,
        coverImageUrl: '',
        tags: ['Wisata Bahari', 'Petualangan'],
        status: 'PUBLISHED',
        isFeatured: false,
        days: [],
      });
      setDays([
        { dayNumber: 1, title: 'Hari 1: Eksplorasi Pantai Selatan', description: 'Tiba di Lombok & check-in', activities: [] },
      ]);
      setContentLocale('id-ID');
    }
  }, [itineraryToEdit, reset]);

  const handleAddDay = () => {
    const nextDay = days.length + 1;
    setDays((prev) => [
      ...prev,
      { dayNumber: nextDay, title: `Hari ${nextDay}: Petualangan Baru`, description: '', activities: [] },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    setDays((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 })));
  };

  const mutation = useMutation({
    mutationFn: async (data: ItineraryFormData) => {
      const translations = buildItineraryTranslations(data);
      const payload: any = {
        ...data,
        days,
        translations,
      };

      if (payload.coverImage && typeof payload.coverImage === 'object' && 'secureUrl' in payload.coverImage) {
        payload.coverImageUrl = payload.coverImage.secureUrl;
      }

      if (isEdit && itineraryToEdit) {
        return itineraryApi.updateItinerary(itineraryToEdit.id, payload);
      } else {
        return itineraryApi.createItinerary(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (itineraryToEdit) {
        queryClient.invalidateQueries({ queryKey: ['itineraries', itineraryToEdit.id] });
      }
      onSuccess();
      onOpenChange(false);
    },
    onError: (err) => {
      setBackendValidationErrors(err, setError);
    },
  });

  const onSubmit = (data: ItineraryFormData) => {
    if (isUploading) return;
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.itineraries.editTitle : t.itineraries.createTitle}</DialogTitle>
        <DialogDescription>{t.itineraries.modalDesc}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[72vh] overflow-y-auto px-1">
        {/* Multilingual Translation Editor */}
        <TranslationEditor
          currentLocale={contentLocale}
          onLocaleChange={setContentLocale}
          statusMap={statusMap}
          hasUnsavedChanges={isDirty}
          onAddTranslation={() => setContentLocale('en-US')}
        >
          {(locale) =>
            locale === 'id-ID' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.itineraries.templateTitle} (id-ID) *
                    </label>
                    <Input placeholder="cth: 3 Hari Eksplorasi Mandalika" error={errors.title?.message} {...register('title')} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.itineraries.slug} ({t.common.optional})
                    </label>
                    <Input placeholder="3-hari-eksplorasi-mandalika" error={errors.slug?.message} {...register('slug')} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.itineraries.description} (id-ID) *
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Deskripsi paket liburan, target wisatawan, daya tarik utama..."
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.itineraries.transportPaceNote} (id-ID)
                  </label>
                  <Input
                    placeholder="cth: Ritme santai, disarankan menyewa mobil ber-AC"
                    {...register('transportPaceNote')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.itineraries.templateTitle} (en-US)
                  </label>
                  <Input
                    placeholder="e.g. 3-Day South Lombok Coastal Adventure"
                    error={errors.en_title?.message}
                    {...register('en_title')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.itineraries.description} (en-US)
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Discover the most scenic beaches and hills in South Lombok..."
                    error={errors.en_description?.message}
                    {...register('en_description')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.itineraries.transportPaceNote} (en-US)
                  </label>
                  <Input
                    placeholder="e.g. Relaxed pace with private rented car"
                    {...register('en_transportPaceNote')}
                  />
                </div>
              </div>
            )
          }
        </TranslationEditor>

        {/* Duration & Budget (Shared) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.itineraries.durationDays} *</label>
            <Input type="number" min={1} max={14} error={errors.durationDays?.message} {...register('durationDays')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.itineraries.estimatedCost} (IDR)</label>
            <Input type="number" placeholder="1500000" error={errors.estimatedCost?.message} {...register('estimatedCost')} />
          </div>
        </div>

        {/* Days & Routing Breakdown (Shared) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Susunan Rute Harian ({days.length} Hari)
            </label>
            <Button type="button" size="sm" variant="outline" onClick={handleAddDay} className="h-7 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" />
              Tambah Hari
            </Button>
          </div>

          <div className="space-y-2">
            {days.map((day, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Hari ke-{day.dayNumber}</span>
                  {days.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Hapus Hari"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Input
                  value={day.title}
                  onChange={(e) => {
                    const newDays = [...days];
                    newDays[idx].title = e.target.value;
                    setDays(newDays);
                  }}
                  placeholder="Judul rute hari ini..."
                  className="bg-white text-xs h-8"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Shared Cover Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.itineraries.coverImage}</label>
          <ImageUploader
            resourceType="ITINERARY_TEMPLATE"
            multiple={false}
            maxFiles={1}
            value={watch('coverImage') as CloudinaryAsset | null}
            onChange={(asset) => {
              const primary = Array.isArray(asset) ? asset[0] : asset;
              reset((prev) => ({
                ...prev,
                coverImage: primary || null,
                coverImageUrl: primary ? primary.secureUrl : '',
              }));
            }}
            onUploadingChange={setIsUploading}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="itinFeatured"
              checked={watch('isFeatured')}
              onCheckedChange={(checked) => reset((prev) => ({ ...prev, isFeatured: Boolean(checked) }))}
            />
            <label htmlFor="itinFeatured" className="text-xs font-medium text-slate-700 cursor-pointer">
              {t.destinations.isFeatured}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">{t.common.status}:</span>
            <Select className="w-36 h-8 text-xs" {...register('status')}>
              <option value="PUBLISHED">{t.statuses.PUBLISHED}</option>
              <option value="DRAFT">{t.statuses.DRAFT}</option>
              <option value="ARCHIVED">{t.statuses.ARCHIVED}</option>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {t.common.cancel}
          </Button>
          <Button type="submit" isLoading={mutation.isPending || isUploading} disabled={isUploading}>
            {isEdit ? t.common.saveChanges : t.common.create}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
