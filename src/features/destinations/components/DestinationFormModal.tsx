import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { destinationSchema, DestinationFormData } from '../schemas/destination.schema';
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

interface DestinationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinationToEdit?: DestinationDetail | null;
  onSuccess: () => void;
}

export function DestinationFormModal({
  open,
  onOpenChange,
  destinationToEdit,
  onSuccess,
}: DestinationFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(destinationToEdit);
  const [isUploading, setIsUploading] = useState(false);

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      categoryId: '',
      region: 'LOMBOK_SELATAN',
      locationName: '',
      address: '',
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

  useEffect(() => {
    if (destinationToEdit) {
      reset({
        name: destinationToEdit.name,
        slug: destinationToEdit.slug,
        shortDescription: destinationToEdit.shortDescription || '',
        description: destinationToEdit.description,
        categoryId: destinationToEdit.categoryId,
        region: destinationToEdit.region,
        locationName: destinationToEdit.locationName,
        address: destinationToEdit.address || '',
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
    } else {
      reset({
        name: '',
        slug: '',
        shortDescription: '',
        description: '',
        categoryId: catData?.[0]?.id || '',
        region: 'LOMBOK_SELATAN',
        locationName: '',
        address: '',
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
    }
  }, [destinationToEdit, reset, catData]);

  const mutation = useMutation({
    mutationFn: async (data: DestinationFormData) => {
      if (isEdit && destinationToEdit) {
        return destinationApi.updateDestination(destinationToEdit.id, data);
      } else {
        return destinationApi.createDestination(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: any) => {
    if (isUploading) {
      return;
    }
    const payload = { ...data };
    if (payload.coverImage && typeof payload.coverImage === 'object' && 'secureUrl' in payload.coverImage) {
      payload.coverImageUrl = payload.coverImage.secureUrl;
    }
    mutation.mutate(payload);
  };

  const isFeaturedValue = watch('isFeatured');

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Data Destinasi' : 'Tambah Destinasi Baru'}</DialogTitle>
        <DialogDescription>
          Isi detail informasi destinasi pariwisata Lombok sesuai spesifikasi OpenAPI.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Destinasi *</label>
            <Input placeholder="cth: Pantai Tanjung Aan" error={errors.name?.message} {...register('name')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug (Opsional)</label>
            <Input placeholder="pantai-tanjung-aan" error={errors.slug?.message} {...register('slug')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Wisata *</label>
            <Select error={errors.categoryId?.message} {...register('categoryId')}>
              <option value="">Pilih Kategori</option>
              {catData?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Wilayah / Kabupaten *</label>
            <Select error={errors.region?.message} {...register('region')}>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
          <Input placeholder="Ringkasan 1-2 kalimat untuk kartu destinasi..." {...register('shortDescription')} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Lengkap *</label>
          <Textarea
            rows={3}
            placeholder="Informasi komprehensif mengenai keunikan, lanskap alam, daya tarik utama..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        {/* Location & Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lokasi *</label>
            <Input placeholder="cth: Sengkol, Pujut" error={errors.locationName?.message} {...register('locationName')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
            <Input type="number" step="any" placeholder="-8.9056" error={errors.latitude?.message} {...register('latitude')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
            <Input type="number" step="any" placeholder="116.3211" error={errors.longitude?.message} {...register('longitude')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
          <Input placeholder="Alamat jalan lengkap jika ada..." {...register('address')} />
        </div>

        {/* Operational & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tiket Masuk (IDR)</label>
            <Input type="number" placeholder="10000" error={errors.ticketPrice?.message} {...register('ticketPrice')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Operasional</label>
            <Input placeholder="cth: 06:00 - 18:30 WITA" {...register('openingHours')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kesulitan</label>
            <Select {...register('difficulty')}>
              <option value="EASY">Mudah (EASY)</option>
              <option value="MODERATE">Sedang (MODERATE)</option>
              <option value="CHALLENGING">Menantang (CHALLENGING)</option>
              <option value="EXTREME">Ekstrem (EXTREME)</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Durasi (Menit)</label>
            <Input type="number" placeholder="120" {...register('estimatedDurationMinutes')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Berkunjung Terbaik</label>
            <Input placeholder="cth: Sore hari menjelang sunset" {...register('bestVisitingTime')} />
          </div>
        </div>

        {/* Media: Cover Image & Gallery */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <ImageUploader
            resourceType="DESTINATION"
            resourceId={destinationToEdit?.id}
            multiple={false}
            label="Foto Sampul Destinasi *"
            description="Unggah foto utama beresolusi tinggi untuk destinasi (JPG, PNG, atau WebP)"
            value={watch('coverImage')}
            onChange={(asset) => {
              setValue('coverImage', asset, { shouldValidate: true });
              setValue('coverImageUrl', asset?.secureUrl || '', { shouldValidate: true });
            }}
            onUploadingChange={setIsUploading}
            error={(errors.coverImage?.message as string) || errors.coverImageUrl?.message}
          />

          <ImageUploader
            resourceType="DESTINATION"
            resourceId={destinationToEdit?.id}
            multiple={true}
            maxFiles={10}
            label="Galeri Foto Destinasi"
            description="Unggah hingga 10 foto pendukung untuk galeri destinasi. Anda dapat menandai foto utama dan mengubah urutan."
            value={watch('images')}
            onChange={(assets) => setValue('images', assets, { shouldValidate: true })}
            onUploadingChange={setIsUploading}
            showCaptionFields={true}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Publikasi</label>
            <Select {...register('status')}>
              <option value="PUBLISHED">PUBLISHED (Aktif)</option>
              <option value="DRAFT">DRAFT (Konsep)</option>
              <option value="ARCHIVED">ARCHIVED (Diarsipkan)</option>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="isFeatured"
              checked={isFeaturedValue}
              onCheckedChange={(checked) => setValue('isFeatured', checked)}
            />
            <label htmlFor="isFeatured" className="text-xs font-medium text-slate-700 cursor-pointer">
              Tampilkan sebagai Destinasi Unggulan (Featured)
            </label>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending} disabled={mutation.isPending || isUploading}>
            {isUploading ? 'Mengunggah Gambar...' : isEdit ? 'Simpan Perubahan' : 'Terbitkan Destinasi'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
