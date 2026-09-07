import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';

export const destinationSchema = z.object({
  name: z.string().min(3, 'Nama destinasi minimal 3 karakter').max(150, 'Nama terlalu panjang'),
  slug: z.string().optional(),
  shortDescription: z.string().max(250, 'Maksimal 250 karakter').optional(),
  description: z.string().min(10, 'Deskripsi lengkap minimal 10 karakter'),
  categoryId: z.string().min(1, 'Kategori destinasi wajib dipilih'),
  region: z.enum([
    'LOMBOK_SELATAN',
    'LOMBOK_UTARA',
    'LOMBOK_BARAT',
    'LOMBOK_TIMUR',
    'LOMBOK_TENGAH',
    'GILI_ISLANDS',
  ]),
  locationName: z.string().min(2, 'Nama lokasi wajib diisi'),
  address: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  ticketPrice: z.coerce.number().min(0, 'Harga tiket tidak boleh negatif').default(0),
  entranceFee: z.coerce.number().min(0).optional(),
  currency: z.string().default('IDR'),
  openingHours: z.string().optional(),
  estimatedDurationMinutes: z.coerce.number().min(0).optional(),
  bestVisitingTime: z.string().optional(),
  difficulty: z.enum(['EASY', 'MODERATE', 'CHALLENGING', 'EXTREME']).default('EASY'),
  tags: z.array(z.string()).default([]),
  coverImage: z.custom<CloudinaryAsset | string | null>().optional(),
  coverImageUrl: z.string().optional(),
  images: z.array(z.custom<CloudinaryAsset | string>()).default([]),
  facilities: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  isFeatured: z.boolean().default(false),
});

export type DestinationFormData = z.infer<typeof destinationSchema>;
