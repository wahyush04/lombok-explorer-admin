import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategoryFormData } from '../schemas/category.schema';
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

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  onSuccess: () => void;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  categoryToEdit,
  onSuccess,
}: CategoryFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(categoryToEdit);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      iconName: 'waves',
      coverImage: null,
      coverImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
      status: 'PUBLISHED',
    },
  });

  useEffect(() => {
    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name,
        slug: categoryToEdit.slug,
        description: categoryToEdit.description || '',
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
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        iconName: 'waves',
        coverImage: null,
        coverImageUrl: '',
        status: 'PUBLISHED',
      });
    }
  }, [categoryToEdit, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const payload: any = { ...data };
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
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: any) => {
    if (isUploading) return;
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Kategori Wisata' : 'Tambah Kategori Wisata Baru'}</DialogTitle>
        <DialogDescription>
          Kelompokkan daya tarik pariwisata Lombok berdasarkan jenis atraksi dan minat wisatawan.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kategori *</label>
          <Input placeholder="cth: Wisata Bahari & Pantai" error={errors.name?.message} {...register('name')} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL (Opsional)</label>
          <Input placeholder="cth: bahari-pantai" error={errors.slug?.message} {...register('slug')} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Singkat *</label>
          <Textarea
            rows={3}
            placeholder="Jelaskan karakteristik destinasi dalam kategori ini..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Icon Identifier (Lucide) *</label>
            <Select error={errors.iconName?.message} {...register('iconName')}>
              <option value="waves">waves (Bahari/Pantai)</option>
              <option value="mountain">mountain (Gunung/Alam)</option>
              <option value="landmark">landmark (Budaya/Sejarah)</option>
              <option value="droplets">droplets (Air Terjun)</option>
              <option value="sun">sun (Pulau/Tropis)</option>
              <option value="compass">compass (Petualangan)</option>
            </Select>
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
          <ImageUploader
            resourceType="CATEGORY"
            resourceId={categoryToEdit?.id}
            multiple={false}
            label="Foto Sampul Kategori (Opsional)"
            description="Pilih foto sampul representatif untuk kategori ini"
            value={watch('coverImage')}
            onChange={(asset) => {
              setValue('coverImage', asset, { shouldValidate: true });
              setValue('coverImageUrl', asset?.secureUrl || '', { shouldValidate: true });
            }}
            onUploadingChange={setIsUploading}
            error={(errors.coverImage?.message as string) || errors.coverImageUrl?.message}
          />
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending} disabled={mutation.isPending || isUploading}>
            {isUploading ? 'Mengunggah Gambar...' : isEdit ? 'Simpan Perubahan' : 'Simpan Kategori'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
