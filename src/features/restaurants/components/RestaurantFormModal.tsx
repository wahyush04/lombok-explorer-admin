import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { restaurantSchema, RestaurantFormData } from '../schemas/restaurant.schema';
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

interface RestaurantFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantToEdit?: Restaurant | null;
  onSuccess: () => void;
}

export function RestaurantFormModal({
  open,
  onOpenChange,
  restaurantToEdit,
  onSuccess,
}: RestaurantFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(restaurantToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
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
      coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947',
      isHalalCertified: true,
      status: 'PUBLISHED',
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (restaurantToEdit) {
      reset({
        name: restaurantToEdit.name,
        slug: restaurantToEdit.slug,
        description: restaurantToEdit.description,
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
        coverImageUrl: restaurantToEdit.coverImageUrl,
        isHalalCertified: restaurantToEdit.isHalalCertified,
        status: restaurantToEdit.status,
        isFeatured: restaurantToEdit.isFeatured,
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        cuisineType: 'Tradisional Sasak',
        specialtyDish: 'Ayam Taliwang Pedas Gurih',
        priceRange: 'Rp 25.000 - Rp 80.000',
        minPrice: 25000,
        maxPrice: 80000,
        address: '',
        region: 'LOMBOK_BARAT',
        latitude: -8.5833,
        longitude: 116.1167,
        openingHours: '09:00 - 22:00 WITA',
        coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947',
        isHalalCertified: true,
        status: 'PUBLISHED',
        isFeatured: false,
      });
    }
  }, [restaurantToEdit, reset]);

  const mutation = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      if (isEdit && restaurantToEdit) {
        return restaurantApi.updateRestaurant(restaurantToEdit.id, data);
      } else {
        return restaurantApi.createRestaurant(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const isHalalValue = watch('isHalalCertified');
  const isFeaturedValue = watch('isFeatured');

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Data Restoran / Kuliner' : 'Tambah Restoran Baru'}</DialogTitle>
        <DialogDescription>
          Data kuliner khas Lombok, rumah makan, warung autentik, dan kafe tepi pantai.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Tempat Kuliner *</label>
            <Input placeholder="cth: Rumah Makan Ayam Taliwang H. Moerad" error={errors.name?.message} {...register('name')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug (Opsional)</label>
            <Input placeholder="ayam-taliwang-h-moerad" error={errors.slug?.message} {...register('slug')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kuliner *</label>
            <Input placeholder="cth: Tradisional Sasak / Seafood Segar" error={errors.cuisineType?.message} {...register('cuisineType')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Menu Andalan / Spesial *</label>
            <Input placeholder="cth: Ayam Bakar Taliwang & Beberuk Terong" error={errors.specialtyDish?.message} {...register('specialtyDish')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Kuliner & Tempat *</label>
          <Textarea
            rows={3}
            placeholder="Kisah sejarah, cita rasa bumbu, suasana tempat makan..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Minimum (IDR)</label>
            <Input type="number" placeholder="25000" error={errors.minPrice?.message} {...register('minPrice')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Maksimum (IDR)</label>
            <Input type="number" placeholder="80000" error={errors.maxPrice?.message} {...register('maxPrice')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rentang Harga Teks</label>
            <Input placeholder="Rp 25.000 - Rp 80.000" {...register('priceRange')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Operasional</label>
            <Input placeholder="cth: 09:00 - 22:00 WITA" {...register('openingHours')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap *</label>
          <Input placeholder="Jl. Pelikan No. 6, Cakranegara..." error={errors.address?.message} {...register('address')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
            <Input type="number" step="any" placeholder="-8.5833" error={errors.latitude?.message} {...register('latitude')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
            <Input type="number" step="any" placeholder="116.1167" error={errors.longitude?.message} {...register('longitude')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">URL Foto Sampul Restoran *</label>
          <Input placeholder="https://images.unsplash.com/..." error={errors.coverImageUrl?.message} {...register('coverImageUrl')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
              id="isHalal"
              checked={isHalalValue}
              onCheckedChange={(checked) => setValue('isHalalCertified', checked)}
            />
            <label htmlFor="isHalal" className="text-xs font-medium text-slate-700 cursor-pointer">
              Tersertifikasi / Sajian Halal
            </label>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="isFeaturedRest"
              checked={isFeaturedValue}
              onCheckedChange={(checked) => setValue('isFeatured', checked)}
            />
            <label htmlFor="isFeaturedRest" className="text-xs font-medium text-slate-700 cursor-pointer">
              Kuliner Rekomendasi (Featured)
            </label>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Simpan Perubahan' : 'Simpan Restoran'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
