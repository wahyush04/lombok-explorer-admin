import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accommodationSchema, AccommodationFormData } from '../schemas/accommodation.schema';
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

interface AccommodationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodationToEdit?: Accommodation | null;
  onSuccess: () => void;
}

export function AccommodationFormModal({
  open,
  onOpenChange,
  accommodationToEdit,
  onSuccess,
}: AccommodationFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(accommodationToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccommodationFormData>({
    resolver: zodResolver(accommodationSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      type: 'Resort Tepi Pantai',
      description: '',
      pricePerNight: 750000,
      currency: 'IDR',
      address: '',
      region: 'LOMBOK_BARAT',
      latitude: -8.4912,
      longitude: 116.0398,
      coverImageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
      facilities: ['WiFi Gratis', 'Kolam Renang', 'Restoran'],
      amenities: ['AC', 'Kamar Mandi Pribadi'],
      contactPhone: '',
      websiteUrl: '',
      status: 'PUBLISHED',
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (accommodationToEdit) {
      reset({
        name: accommodationToEdit.name,
        slug: accommodationToEdit.slug,
        type: accommodationToEdit.type,
        description: accommodationToEdit.description,
        pricePerNight: accommodationToEdit.pricePerNight,
        currency: accommodationToEdit.currency || 'IDR',
        address: accommodationToEdit.address,
        region: accommodationToEdit.region,
        latitude: accommodationToEdit.latitude,
        longitude: accommodationToEdit.longitude,
        coverImageUrl: accommodationToEdit.coverImageUrl,
        facilities: accommodationToEdit.facilities || [],
        amenities: accommodationToEdit.amenities || [],
        contactPhone: accommodationToEdit.contactPhone || '',
        websiteUrl: accommodationToEdit.websiteUrl || '',
        status: accommodationToEdit.status,
        isFeatured: accommodationToEdit.isFeatured,
      });
    } else {
      reset({
        name: '',
        slug: '',
        type: 'Resort Bintang 4',
        description: '',
        pricePerNight: 850000,
        currency: 'IDR',
        address: '',
        region: 'LOMBOK_BARAT',
        latitude: -8.4912,
        longitude: 116.0398,
        coverImageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
        facilities: ['WiFi Cepat', 'Kolam Renang', 'Sarapan Termasuk'],
        amenities: ['AC', 'Air Hangat'],
        contactPhone: '',
        websiteUrl: '',
        status: 'PUBLISHED',
        isFeatured: false,
      });
    }
  }, [accommodationToEdit, reset]);

  const mutation = useMutation({
    mutationFn: async (data: AccommodationFormData) => {
      if (isEdit && accommodationToEdit) {
        return accommodationApi.updateAccommodation(accommodationToEdit.id, data);
      } else {
        return accommodationApi.createAccommodation(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] });
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
        <DialogTitle>{isEdit ? 'Edit Data Akomodasi' : 'Tambah Akomodasi Baru'}</DialogTitle>
        <DialogDescription>
          Kelola data hotel, resort, villa, glamping, atau homestay di seluruh wilayah pulau Lombok.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Akomodasi *</label>
            <Input placeholder="cth: Katamaran Hotel & Resort" error={errors.name?.message} {...register('name')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Properti *</label>
            <Input placeholder="cth: Resort Bintang 5 / Eco Glamping" error={errors.type?.message} {...register('type')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Akomodasi *</label>
          <Textarea
            rows={3}
            placeholder="Kenyamanan kamar, panorama pemandangan, layanan staf, akses pantai..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Per Malam (IDR) *</label>
            <Input type="number" placeholder="850000" error={errors.pricePerNight?.message} {...register('pricePerNight')} />
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap Properti *</label>
          <Input placeholder="Jl. Raya Senggigi, Mangsit, Batu Layar..." error={errors.address?.message} {...register('address')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / Reservasi</label>
            <Input placeholder="+62 370 6197888" {...register('contactPhone')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Website Resmi</label>
            <Input placeholder="https://katamaranresort.com" error={errors.websiteUrl?.message} {...register('websiteUrl')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
            <Input type="number" step="any" placeholder="-8.4912" error={errors.latitude?.message} {...register('latitude')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
            <Input type="number" step="any" placeholder="116.0398" error={errors.longitude?.message} {...register('longitude')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">URL Foto Sampul Akomodasi *</label>
          <Input placeholder="https://images.unsplash.com/..." error={errors.coverImageUrl?.message} {...register('coverImageUrl')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <Select {...register('status')}>
              <option value="PUBLISHED">PUBLISHED (Aktif)</option>
              <option value="DRAFT">DRAFT (Konsep)</option>
              <option value="ARCHIVED">ARCHIVED (Arsip)</option>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="isFeaturedAcc"
              checked={isFeaturedValue}
              onCheckedChange={(checked) => setValue('isFeatured', checked)}
            />
            <label htmlFor="isFeaturedAcc" className="text-xs font-medium text-slate-700 cursor-pointer">
              Tandai sebagai Akomodasi Unggulan (Featured)
            </label>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Simpan Perubahan' : 'Simpan Akomodasi'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
