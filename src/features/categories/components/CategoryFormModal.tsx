import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategoryFormData, buildCategoryTranslations } from '../schemas/category.schema';
import { categoryApi } from '../api/category.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Category } from '@/types/category.types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { CloudinaryAsset } from '@/types/upload.types';
import { SupportedLocale } from '@/lib/constants/locales';
import { TranslationCompleteness, calculateTranslationStatus } from '@/types/localization.types';
import { TranslationEditor } from '@/components/localization/TranslationEditor';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { setBackendValidationErrors } from '@/lib/api/api-error';

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: (Category & { translations?: any[] }) | null;
  onSuccess: () => void;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  categoryToEdit,
  onSuccess,
}: CategoryFormModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = Boolean(categoryToEdit);
  const [isUploading, setIsUploading] = useState(false);
  const [contentLocale, setContentLocale] = useState<SupportedLocale>('id-ID');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isDirty },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      en_name: '',
      en_description: '',
      iconName: 'waves',
      coverImage: null,
      coverImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
      status: 'PUBLISHED',
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
    if (categoryToEdit) {
      const enTrans = categoryToEdit.translations?.find((tr: any) => tr.locale === 'en-US');

      reset({
        name: categoryToEdit.name,
        slug: categoryToEdit.slug,
        description: categoryToEdit.description || '',
        en_name: enTrans?.name || '',
        en_description: enTrans?.description || '',
        iconName: categoryToEdit.iconName || 'waves',
        coverImage: categoryToEdit.coverImageUrl
          ? {
              publicId: 'existing_cover',
              secureUrl: categoryToEdit.coverImageUrl,
              resourceType: 'image',
              isPrimary: true,
              orderIndex: 0,
            }
          : null,
        coverImageUrl: categoryToEdit.coverImageUrl || '',
        status: categoryToEdit.status,
      });
      setContentLocale('id-ID');
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        en_name: '',
        en_description: '',
        iconName: 'waves',
        coverImage: null,
        coverImageUrl: '',
        status: 'PUBLISHED',
      });
      setContentLocale('id-ID');
    }
  }, [categoryToEdit, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const translations = buildCategoryTranslations(data);
      const payload: any = {
        ...data,
        translations,
      };

      if (payload.coverImage && typeof payload.coverImage === 'object' && 'secureUrl' in payload.coverImage) {
        payload.coverImageUrl = payload.coverImage.secureUrl;
      }

      if (isEdit && categoryToEdit) {
        return categoryApi.updateCategory(categoryToEdit.id, payload);
      } else {
        return categoryApi.createCategory(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (categoryToEdit) {
        queryClient.invalidateQueries({ queryKey: ['categories', categoryToEdit.id] });
      }
      onSuccess();
      onOpenChange(false);
    },
    onError: (err) => {
      setBackendValidationErrors(err, setError);
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (isUploading) return;
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.categories.editTitle : t.categories.createTitle}</DialogTitle>
        <DialogDescription>{t.categories.modalDesc}</DialogDescription>
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
                      {t.categories.name} (id-ID) *
                    </label>
                    <Input placeholder="cth: Wisata Bahari" error={errors.name?.message} {...register('name')} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.categories.slug} ({t.common.optional})
                    </label>
                    <Input placeholder="wisata-bahari" error={errors.slug?.message} {...register('slug')} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.categories.description} (id-ID) *
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Deskripsi kategori wisata untuk mobile app..."
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.categories.name} (en-US)
                  </label>
                  <Input
                    placeholder="e.g. Marine & Beach Tourism"
                    error={errors.en_name?.message}
                    {...register('en_name')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.categories.description} (en-US)
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Tropical beaches and exotic island adventures..."
                    error={errors.en_description?.message}
                    {...register('en_description')}
                  />
                </div>
              </div>
            )
          }
        </TranslationEditor>

        {/* Icon & Shared Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.categories.iconName} *</label>
            <Input placeholder="waves / mountain / landmark" error={errors.iconName?.message} {...register('iconName')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.common.status}</label>
            <Select error={errors.status?.message} {...register('status')}>
              <option value="PUBLISHED">{t.statuses.PUBLISHED}</option>
              <option value="DRAFT">{t.statuses.DRAFT}</option>
              <option value="ARCHIVED">{t.statuses.ARCHIVED}</option>
            </Select>
          </div>
        </div>

        {/* Shared Cover Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.categories.coverImage}</label>
          <ImageUploader
            resourceType="CATEGORY"
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
