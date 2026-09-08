import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { restaurantSchema, RestaurantFormData, buildRestaurantTranslations } from '../schemas/restaurant.schema';
import { restaurantApi } from '../api/restaurant.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Restaurant } from '@/types/restaurant.types';
import { REGIONS } from '@/types/common.types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { CloudinaryAsset } from '@/types/upload.types';
import { SupportedLocale } from '@/lib/constants/locales';
import { TranslationCompleteness, calculateTranslationStatus } from '@/types/localization.types';
import { TranslationEditor } from '@/components/localization/TranslationEditor';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { setBackendValidationErrors } from '@/lib/api/api-error';

interface RestaurantFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantToEdit?: (Restaurant & { translations?: any[] }) | null;
  onSuccess: () => void;
}

export function RestaurantFormModal({
  open,
  onOpenChange,
  restaurantToEdit,
  onSuccess,
}: RestaurantFormModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = Boolean(restaurantToEdit);
  const [isUploading, setIsUploading] = useState(false);
  const [contentLocale, setContentLocale] = useState<SupportedLocale>('id-ID');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isDirty },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      en_name: '',
      en_description: '',
      cuisineType: 'Kuliner Tradisional Sasak',
      specialtyDish: 'Ayam Taliwang & Plecing Kangkung',
      priceRange: 'Rp 25.000 - Rp 75.000',
      minPrice: 25000,
      maxPrice: 75000,
      address: '',
      region: 'LOMBOK_BARAT',
      latitude: -8.5833,
      longitude: 116.1167,
      openingHours: '09:00 - 22:00 WITA',
      coverImage: null,
      coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947',
      images: [],
      isHalalCertified: true,
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
    if (restaurantToEdit) {
      const enTrans = restaurantToEdit.translations?.find((tr: any) => tr.locale === 'en-US');

      reset({
        name: restaurantToEdit.name,
        slug: restaurantToEdit.slug,
        description: restaurantToEdit.description,
        en_name: enTrans?.name || '',
        en_description: enTrans?.description || '',
        cuisineType: restaurantToEdit.cuisineType,
        specialtyDish: restaurantToEdit.specialtyDish,
        priceRange: restaurantToEdit.priceRange || '',
        minPrice: restaurantToEdit.minPrice || 25000,
        maxPrice: restaurantToEdit.maxPrice || 75000,
        address: restaurantToEdit.address,
        region: restaurantToEdit.region,
        latitude: restaurantToEdit.latitude,
        longitude: restaurantToEdit.longitude,
        openingHours: restaurantToEdit.openingHours || '',
        coverImage: restaurantToEdit.coverImageUrl
          ? {
              publicId: 'existing_cover',
              secureUrl: restaurantToEdit.coverImageUrl,
              resourceType: 'image',
              isPrimary: true,
              orderIndex: 0,
            }
          : null,
        coverImageUrl: restaurantToEdit.coverImageUrl,
        images: restaurantToEdit.images || [],
        isHalalCertified: restaurantToEdit.isHalalCertified,
        status: restaurantToEdit.status,
        isFeatured: restaurantToEdit.isFeatured,
      });
      setContentLocale('id-ID');
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        en_name: '',
        en_description: '',
        cuisineType: 'Kuliner Tradisional Sasak',
        specialtyDish: 'Ayam Taliwang & Plecing Kangkung',
        priceRange: 'Rp 25.000 - Rp 75.000',
        minPrice: 25000,
        maxPrice: 75000,
        address: '',
        region: 'LOMBOK_BARAT',
        latitude: -8.5833,
        longitude: 116.1167,
        openingHours: '09:00 - 22:00 WITA',
        coverImage: null,
        coverImageUrl: '',
        images: [],
        isHalalCertified: true,
        status: 'PUBLISHED',
        isFeatured: false,
      });
      setContentLocale('id-ID');
    }
  }, [restaurantToEdit, reset]);

  const mutation = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      const translations = buildRestaurantTranslations(data);
      const payload: any = {
        ...data,
        translations,
      };

      if (payload.coverImage && typeof payload.coverImage === 'object' && 'secureUrl' in payload.coverImage) {
        payload.coverImageUrl = payload.coverImage.secureUrl;
      }

      if (isEdit && restaurantToEdit) {
        return restaurantApi.updateRestaurant(restaurantToEdit.id, payload);
      } else {
        return restaurantApi.createRestaurant(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (restaurantToEdit) {
        queryClient.invalidateQueries({ queryKey: ['restaurants', restaurantToEdit.id] });
      }
      onSuccess();
      onOpenChange(false);
    },
    onError: (err) => {
      setBackendValidationErrors(err, setError);
    },
  });

  const onSubmit = (data: RestaurantFormData) => {
    if (isUploading) return;
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.restaurants.editTitle : t.restaurants.createTitle}</DialogTitle>
        <DialogDescription>{t.restaurants.modalDesc}</DialogDescription>
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
                      {t.restaurants.name} (id-ID) *
                    </label>
                    <Input placeholder="cth: RM Ayam Taliwang Pak Udin" error={errors.name?.message} {...register('name')} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.restaurants.slug} ({t.common.optional})
                    </label>
                    <Input placeholder="rm-ayam-taliwang-pak-udin" error={errors.slug?.message} {...register('slug')} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.restaurants.description} (id-ID) *
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Deskripsi cita rasa, sejarah kuliner, resep khas Sasak..."
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.restaurants.name} (en-US)
                  </label>
                  <Input
                    placeholder="e.g. Pak Udin Authentic Taliwang Chicken"
                    error={errors.en_name?.message}
                    {...register('en_name')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.restaurants.description} (en-US)
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Authentic spicy grilled chicken with traditional Sasak spices..."
                    error={errors.en_description?.message}
                    {...register('en_description')}
                  />
                </div>
              </div>
            )
          }
        </TranslationEditor>

        {/* Cuisine & Specialty (Shared) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.restaurants.cuisineType} *</label>
            <Input placeholder="Tradisional Sasak, Seafood, Cafe" error={errors.cuisineType?.message} {...register('cuisineType')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.restaurants.specialtyDish} *</label>
            <Input placeholder="Ayam Taliwang, Plecing Kangkung" error={errors.specialtyDish?.message} {...register('specialtyDish')} />
          </div>
        </div>

        {/* Price & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.restaurants.minPrice} (IDR)</label>
            <Input type="number" placeholder="25000" error={errors.minPrice?.message} {...register('minPrice')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.restaurants.maxPrice} (IDR)</label>
            <Input type="number" placeholder="75000" error={errors.maxPrice?.message} {...register('maxPrice')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.restaurants.region} *</label>
            <Select error={errors.region?.message} {...register('region')}>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {(t.regions as any)[r.value] || r.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.restaurants.address} *</label>
          <Input placeholder="Jl. Raya Senggigi No. 12, Senggigi, Lombok Barat" error={errors.address?.message} {...register('address')} />
        </div>

        {/* Location Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.latitude} *</label>
            <Input type="number" step="any" placeholder="-8.5833" error={errors.latitude?.message} {...register('latitude')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.destinations.longitude} *</label>
            <Input type="number" step="any" placeholder="116.1167" error={errors.longitude?.message} {...register('longitude')} />
          </div>
        </div>

        {/* Operating Hours & Media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.restaurants.openingHours}</label>
            <Input placeholder="09:00 - 22:00 WITA" error={errors.openingHours?.message} {...register('openingHours')} />
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="isHalal"
              checked={watch('isHalalCertified')}
              onCheckedChange={(checked) => reset((prev) => ({ ...prev, isHalalCertified: Boolean(checked) }))}
            />
            <label htmlFor="isHalal" className="text-xs font-medium text-slate-700 cursor-pointer">
              {t.restaurants.isHalal}
            </label>
          </div>
        </div>

        {/* Shared Cover Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.restaurants.coverImage}</label>
          <ImageUploader
            resourceType="RESTAURANT"
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
              id="restFeatured"
              checked={watch('isFeatured')}
              onCheckedChange={(checked) => reset((prev) => ({ ...prev, isFeatured: Boolean(checked) }))}
            />
            <label htmlFor="restFeatured" className="text-xs font-medium text-slate-700 cursor-pointer">
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
