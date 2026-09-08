import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accommodationSchema, AccommodationFormData, buildAccommodationTranslations } from '../schemas/accommodation.schema';
import { accommodationApi } from '../api/accommodation.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accommodation } from '@/types/accommodation.types';
import { REGIONS } from '@/types/common.types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { CloudinaryAsset } from '@/types/upload.types';
import { SupportedLocale } from '@/lib/constants/locales';
import { TranslationCompleteness, calculateTranslationStatus } from '@/types/localization.types';
import { TranslationEditor } from '@/components/localization/TranslationEditor';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { setBackendValidationErrors } from '@/lib/api/api-error';

interface AccommodationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodationToEdit?: (Accommodation & { translations?: any[] }) | null;
  onSuccess: () => void;
}

export function AccommodationFormModal({
  open,
  onOpenChange,
  accommodationToEdit,
  onSuccess,
}: AccommodationFormModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = Boolean(accommodationToEdit);
  const [isUploading, setIsUploading] = useState(false);
  const [contentLocale, setContentLocale] = useState<SupportedLocale>('id-ID');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isDirty },
  } = useForm<AccommodationFormData>({
    resolver: zodResolver(accommodationSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      type: 'Resort Tepi Pantai',
      description: '',
      en_name: '',
      en_description: '',
      pricePerNight: 750000,
      currency: 'IDR',
      address: '',
      region: 'LOMBOK_BARAT',
      latitude: -8.4912,
      longitude: 116.0398,
      coverImage: null,
      coverImageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
      images: [],
      facilities: ['WiFi Gratis', 'Kolam Renang', 'Restoran'],
      amenities: ['AC', 'Kamar Mandi Pribadi'],
      contactPhone: '',
      websiteUrl: '',
      status: 'PUBLISHED',
      isFeatured: false,
    },
  });

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
    if (accommodationToEdit) {
      const enTrans = accommodationToEdit.translations?.find((tr: any) => tr.locale === 'en-US');

      reset({
        name: accommodationToEdit.name,
        slug: accommodationToEdit.slug,
        type: accommodationToEdit.type,
        description: accommodationToEdit.description,
        en_name: enTrans?.name || '',
        en_description: enTrans?.description || '',
        pricePerNight: accommodationToEdit.pricePerNight,
        currency: accommodationToEdit.currency || 'IDR',
        address: accommodationToEdit.address,
        region: accommodationToEdit.region,
        latitude: accommodationToEdit.latitude,
        longitude: accommodationToEdit.longitude,
        coverImage: accommodationToEdit.coverImageUrl
          ? {
              publicId: 'existing_cover',
              secureUrl: accommodationToEdit.coverImageUrl,
              resourceType: 'image',
              isPrimary: true,
              orderIndex: 0,
            }
          : null,
        coverImageUrl: accommodationToEdit.coverImageUrl,
        images: (accommodationToEdit.images || []).map((imgUrl, idx) => ({
          publicId: `existing_img_${idx}`,
          secureUrl: typeof imgUrl === 'string' ? imgUrl : (imgUrl as any)?.secureUrl || (imgUrl as any)?.imageUrl,
          imageUrl: typeof imgUrl === 'string' ? imgUrl : (imgUrl as any)?.secureUrl || (imgUrl as any)?.imageUrl,
          resourceType: 'image',
          orderIndex: idx,
          isPrimary: false,
        })),
        facilities: accommodationToEdit.facilities || [],
        amenities: accommodationToEdit.amenities || [],
        contactPhone: accommodationToEdit.contactPhone || '',
        websiteUrl: accommodationToEdit.websiteUrl || '',
        status: accommodationToEdit.status,
        isFeatured: accommodationToEdit.isFeatured,
      });
      setContentLocale('id-ID');
    } else {
      reset({
        name: '',
        slug: '',
        type: 'Resort Tepi Pantai',
        description: '',
        en_name: '',
        en_description: '',
        pricePerNight: 750000,
        currency: 'IDR',
        address: '',
        region: 'LOMBOK_BARAT',
        latitude: -8.4912,
        longitude: 116.0398,
        coverImage: null,
        coverImageUrl: '',
        images: [],
        facilities: ['WiFi Gratis', 'Kolam Renang', 'Restoran'],
        amenities: ['AC', 'Kamar Mandi Pribadi'],
        contactPhone: '',
        websiteUrl: '',
        status: 'PUBLISHED',
        isFeatured: false,
      });
      setContentLocale('id-ID');
    }
  }, [accommodationToEdit, reset]);

  const mutation = useMutation({
    mutationFn: async (data: AccommodationFormData) => {
      const translations = buildAccommodationTranslations(data);
      const payload: any = {
        ...data,
        translations,
      };

      if (payload.coverImage && typeof payload.coverImage === 'object' && 'secureUrl' in payload.coverImage) {
        payload.coverImageUrl = payload.coverImage.secureUrl;
      }

      if (isEdit && accommodationToEdit) {
        return accommodationApi.updateAccommodation(accommodationToEdit.id, payload);
      } else {
        return accommodationApi.createAccommodation(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (accommodationToEdit) {
        queryClient.invalidateQueries({ queryKey: ['accommodations', accommodationToEdit.id] });
      }
      onSuccess();
      onOpenChange(false);
    },
    onError: (err) => {
      setBackendValidationErrors(err, setError);
    },
  });

  const onSubmit = (data: AccommodationFormData) => {
    if (isUploading) return;
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.accommodations.editTitle : t.accommodations.createTitle}</DialogTitle>
        <DialogDescription>{t.accommodations.modalDesc}</DialogDescription>
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
                      {t.accommodations.name} (id-ID) *
                    </label>
                    <Input placeholder="cth: Katamaran Hotel & Resort" error={errors.name?.message} {...register('name')} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.accommodations.slug} ({t.common.optional})
                    </label>
                    <Input placeholder="katamaran-hotel-resort" error={errors.slug?.message} {...register('slug')} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.accommodations.description} (id-ID) *
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Deskripsi suasana penginapan, pemandangan, dan arsitektur..."
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.accommodations.name} (en-US)
                  </label>
                  <Input
                    placeholder="e.g. Katamaran Hotel & Resort Senggigi"
                    error={errors.en_name?.message}
                    {...register('en_name')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.accommodations.description} (en-US)
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Luxury beachfront resort inspired by traditional Sasak architecture..."
                    error={errors.en_description?.message}
                    {...register('en_description')}
                  />
                </div>
              </div>
            )
          }
        </TranslationEditor>

        {/* Type & Price (Shared) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.accommodations.type} *</label>
            <Input placeholder="Resort Bintang 5, Villa Mewah" error={errors.type?.message} {...register('type')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.accommodations.pricePerNight} (IDR) *</label>
            <Input type="number" placeholder="750000" error={errors.pricePerNight?.message} {...register('pricePerNight')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.accommodations.region} *</label>
            <Select error={errors.region?.message} {...register('region')}>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {(t.regions as any)[r.value] || r.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.accommodations.address} *</label>
          <Input placeholder="Jl. Raya Mangsit, Senggigi, Lombok Barat" error={errors.address?.message} {...register('address')} />
        </div>

        {/* Location Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.latitude} *</label>
            <Input type="number" step="any" placeholder="-8.4912" error={errors.latitude?.message} {...register('latitude')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.longitude} *</label>
            <Input type="number" step="any" placeholder="116.0398" error={errors.longitude?.message} {...register('longitude')} />
          </div>
        </div>

        {/* Contact & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.accommodations.contactPhone}</label>
            <Input placeholder="+62 370 1234567" error={errors.contactPhone?.message} {...register('contactPhone')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.accommodations.websiteUrl}</label>
            <Input placeholder="https://katamaranresort.com" error={errors.websiteUrl?.message} {...register('websiteUrl')} />
          </div>
        </div>

        {/* Shared Media & Uploads (Cover Image & Gallery) */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.accommodations.coverImage}</label>
            <ImageUploader
              resourceType="ACCOMMODATION"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.accommodations.gallery}</label>
            <ImageUploader
              resourceType="ACCOMMODATION_IMAGE"
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

        {/* Status */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accFeatured"
              checked={watch('isFeatured')}
              onCheckedChange={(checked) => reset((prev) => ({ ...prev, isFeatured: Boolean(checked) }))}
            />
            <label htmlFor="accFeatured" className="text-xs font-medium text-slate-700 cursor-pointer">
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
