import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { destinationSchema, DestinationFormData, buildDestinationTranslations } from '../schemas/destination.schema';
import { destinationApi } from '../api/destination.api';
import { categoryApi } from '@/features/categories/api/category.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DestinationDetail } from '@/types/destination.types';
import { REGIONS } from '@/types/common.types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { CloudinaryAsset } from '@/types/upload.types';
import { SupportedLocale } from '@/lib/constants/locales';
import { TranslationCompleteness, calculateTranslationStatus } from '@/types/localization.types';
import { TranslationEditor } from '@/components/localization/TranslationEditor';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { setBackendValidationErrors } from '@/lib/api/api-error';

interface DestinationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinationToEdit?: (DestinationDetail & { translations?: any[] }) | null;
  onSuccess: () => void;
}

export function DestinationFormModal({
  open,
  onOpenChange,
  destinationToEdit,
  onSuccess,
}: DestinationFormModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = Boolean(destinationToEdit);
  const [isUploading, setIsUploading] = useState(false);
  const [contentLocale, setContentLocale] = useState<SupportedLocale>('id-ID');

  // Fetch categories for selection
  const { data: catData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await categoryApi.getCategories({ limit: 50 });
      return res.data;
    },
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isDirty },
  } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      address: '',
      en_name: '',
      en_shortDescription: '',
      en_description: '',
      en_address: '',
      categoryId: '',
      region: 'LOMBOK_SELATAN',
      locationName: '',
      latitude: -8.9,
      longitude: 116.3,
      ticketPrice: 10000,
      entranceFee: 10000,
      currency: 'IDR',
      openingHours: '08:00 - 18:00 WITA',
      estimatedDurationMinutes: 120,
      bestVisitingTime: 'Pagi atau sore hari',
      difficulty: 'EASY',
      tags: ['Pantai', 'Sunset'],
      coverImage: null,
      coverImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
      images: [],
      facilities: ['Area Parkir', 'Toilet'],
      tips: ['Gunakan tabir surya'],
      status: 'PUBLISHED',
      isFeatured: false,
    },
  });

  // Watch fields for live completeness calculation
  const watchedName = watch('name');
  const watchedDesc = watch('description');
  const watchedEnName = watch('en_name');
  const watchedEnDesc = watch('en_description');

  const statusMap = useMemo<Record<SupportedLocale, TranslationCompleteness>>(() => {
    const idStatus = calculateTranslationStatus(
      { locale: 'id-ID', name: watchedName, description: watchedDesc },
      ['name', 'description']
    );

    const enHasAny = Boolean(
      (watchedEnName && watchedEnName.trim()) ||
      (watchedEnDesc && watchedEnDesc.trim())
    );

    const enStatus = enHasAny
      ? calculateTranslationStatus(
          { locale: 'en-US', name: watchedEnName, description: watchedEnDesc },
          ['name', 'description']
        )
      : { status: 'MISSING' as TranslationCompleteness };

    return {
      'id-ID': idStatus.status,
      'en-US': enStatus.status,
    };
  }, [watchedName, watchedDesc, watchedEnName, watchedEnDesc]);

  useEffect(() => {
    if (destinationToEdit) {
      const enTrans = destinationToEdit.translations?.find((tr: any) => tr.locale === 'en-US');

      reset({
        name: destinationToEdit.name,
        slug: destinationToEdit.slug,
        shortDescription: destinationToEdit.shortDescription || '',
        description: destinationToEdit.description,
        address: destinationToEdit.address || '',
        en_name: enTrans?.name || '',
        en_shortDescription: enTrans?.shortDescription || '',
        en_description: enTrans?.description || '',
        en_address: enTrans?.address || '',
        categoryId: destinationToEdit.categoryId,
        region: destinationToEdit.region,
        locationName: destinationToEdit.locationName,
        latitude: destinationToEdit.latitude,
        longitude: destinationToEdit.longitude,
        ticketPrice: destinationToEdit.ticketPrice || destinationToEdit.entranceFee || 0,
        entranceFee: destinationToEdit.entranceFee || destinationToEdit.ticketPrice || 0,
        currency: destinationToEdit.currency || 'IDR',
        openingHours: destinationToEdit.openingHours || '',
        estimatedDurationMinutes: destinationToEdit.estimatedDurationMinutes || 120,
        bestVisitingTime: destinationToEdit.bestVisitingTime || '',
        difficulty: (destinationToEdit.difficulty as any) || 'EASY',
        tags: destinationToEdit.tags || [],
        coverImage: destinationToEdit.coverImageUrl
          ? {
              publicId: 'existing_cover',
              secureUrl: destinationToEdit.coverImageUrl,
              resourceType: 'image',
              isPrimary: true,
              orderIndex: 0,
            }
          : null,
        coverImageUrl: destinationToEdit.coverImageUrl,
        images: destinationToEdit.images || [],
        facilities: destinationToEdit.facilities || [],
        tips: destinationToEdit.tips || [],
        status: destinationToEdit.status,
        isFeatured: destinationToEdit.isFeatured,
      });
      setContentLocale('id-ID');
    } else {
      reset({
        name: '',
        slug: '',
        shortDescription: '',
        description: '',
        address: '',
        en_name: '',
        en_shortDescription: '',
        en_description: '',
        en_address: '',
        categoryId: catData?.[0]?.id || '',
        region: 'LOMBOK_SELATAN',
        locationName: '',
        latitude: -8.9056,
        longitude: 116.3211,
        ticketPrice: 10000,
        currency: 'IDR',
        openingHours: '07:00 - 18:00 WITA',
        estimatedDurationMinutes: 120,
        bestVisitingTime: 'Sore hari menjelang sunset',
        difficulty: 'EASY',
        tags: ['Wisata Alam', 'Pantai'],
        coverImage: null,
        coverImageUrl: '',
        images: [],
        facilities: ['Area Parkir', 'Toilet'],
        tips: ['Bawa air minum'],
        status: 'PUBLISHED',
        isFeatured: false,
      });
      setContentLocale('id-ID');
    }
  }, [destinationToEdit, reset, catData]);

  const mutation = useMutation({
    mutationFn: async (data: DestinationFormData) => {
      const translations = buildDestinationTranslations(data);
      const payload: any = {
        ...data,
        translations,
      };

      if (payload.coverImage && typeof payload.coverImage === 'object' && 'secureUrl' in payload.coverImage) {
        payload.coverImageUrl = payload.coverImage.secureUrl;
      }

      if (isEdit && destinationToEdit) {
        return destinationApi.updateDestination(destinationToEdit.id, payload);
      } else {
        return destinationApi.createDestination(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (destinationToEdit) {
        queryClient.invalidateQueries({ queryKey: ['destinations', destinationToEdit.id] });
      }
      onSuccess();
      onOpenChange(false);
    },
    onError: (err) => {
      setBackendValidationErrors(err, setError);
    },
  });

  const onSubmit = (data: DestinationFormData) => {
    if (isUploading) return;
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.destinations.editTitle : t.destinations.createTitle}</DialogTitle>
        <DialogDescription>{t.destinations.modalDesc}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2 max-h-[72vh] overflow-y-auto px-1">
        {/* Multilingual Content Translation Editor */}
        <TranslationEditor
          currentLocale={contentLocale}
          onLocaleChange={setContentLocale}
          statusMap={statusMap}
          hasUnsavedChanges={isDirty}
          onAddTranslation={() => setContentLocale('en-US')}
        >
          {(locale) =>
            locale === 'id-ID' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.destinations.name} (id-ID) *
                    </label>
                    <Input placeholder="cth: Pantai Tanjung Aan" error={errors.name?.message} {...register('name')} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.destinations.slug} ({t.common.optional})
                    </label>
                    <Input placeholder="pantai-tanjung-aan" error={errors.slug?.message} {...register('slug')} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.destinations.shortDescription} (id-ID)
                  </label>
                  <Input
                    placeholder="Ringkasan 1-2 kalimat untuk kartu destinasi..."
                    error={errors.shortDescription?.message}
                    {...register('shortDescription')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.destinations.description} (id-ID) *
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Informasi komprehensif mengenai keunikan, lanskap alam, daya tarik utama..."
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.destinations.address} (id-ID)
                  </label>
                  <Input
                    placeholder="cth: Desa Sengkol, Pujut, Kabupaten Lombok Tengah"
                    error={errors.address?.message}
                    {...register('address')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.destinations.name} (en-US)
                    </label>
                    <Input
                      placeholder="e.g. Tanjung Aan Beach"
                      error={errors.en_name?.message}
                      {...register('en_name')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.destinations.shortDescription} (en-US)
                    </label>
                    <Input
                      placeholder="White pepper-sand beach in Central Lombok..."
                      error={errors.en_shortDescription?.message}
                      {...register('en_shortDescription')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.destinations.description} (en-US)
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Comprehensive English overview of Tanjung Aan beach..."
                    error={errors.en_description?.message}
                    {...register('en_description')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.destinations.address} (en-US)
                  </label>
                  <Input
                    placeholder="e.g. Sengkol Village, Central Lombok"
                    error={errors.en_address?.message}
                    {...register('en_address')}
                  />
                </div>
              </div>
            )
          }
        </TranslationEditor>

        {/* Category & Region (Shared across translations) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.category} *</label>
            <Select error={errors.categoryId?.message} {...register('categoryId')}>
              <option value="">{t.common.selectOption}</option>
              {catData?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.region} *</label>
            <Select error={errors.region?.message} {...register('region')}>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {(t.regions as any)[r.value] || r.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Location & GPS Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.locationName} *</label>
            <Input placeholder="cth: Sengkol, Pujut" error={errors.locationName?.message} {...register('locationName')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.latitude} *</label>
            <Input type="number" step="any" placeholder="-8.9056" error={errors.latitude?.message} {...register('latitude')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.longitude} *</label>
            <Input type="number" step="any" placeholder="116.3211" error={errors.longitude?.message} {...register('longitude')} />
          </div>
        </div>

        {/* Ticket Price & Operational Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.ticketPrice} (IDR)</label>
            <Input type="number" placeholder="10000" error={errors.ticketPrice?.message} {...register('ticketPrice')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.openingHours}</label>
            <Input placeholder="07:00 - 18:00 WITA" error={errors.openingHours?.message} {...register('openingHours')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.difficulty}</label>
            <Select error={errors.difficulty?.message} {...register('difficulty')}>
              <option value="EASY">{t.difficulties.EASY}</option>
              <option value="MODERATE">{t.difficulties.MODERATE}</option>
              <option value="CHALLENGING">{t.difficulties.CHALLENGING}</option>
              <option value="EXTREME">{t.difficulties.EXTREME}</option>
            </Select>
          </div>
        </div>

        {/* Media & Uploads (Shared across translations - Cloudinary direct signed upload) */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.destinations.coverImage}</label>
            <ImageUploader
              resourceType="DESTINATION"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.destinations.gallery}</label>
            <ImageUploader
              resourceType="DESTINATION_IMAGE"
              multiple={true}
              maxFiles={8}
              value={(watch('images') as CloudinaryAsset[]) || []}
              onChange={(assets) => {
                const list = Array.isArray(assets) ? assets : assets ? [assets] : [];
                reset((prev) => ({
                  ...prev,
                  images: list,
                }));
              }}
              onUploadingChange={setIsUploading}
            />
          </div>
        </div>

        {/* Status and Flags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              checked={watch('isFeatured')}
              onCheckedChange={(checked) => reset((prev) => ({ ...prev, isFeatured: Boolean(checked) }))}
            />
            <label htmlFor="isFeatured" className="text-xs font-medium text-slate-700 cursor-pointer">
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
