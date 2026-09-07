import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';

export const restaurantSchema = z.object({
  name: z.string().min(2, 'Nama restoran minimal 2 karakter').max(150, 'Nama terlalu panjang'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Deskripsi restoran minimal 10 karakter'),
  cuisineType: z.string().min(2, 'Jenis kuliner wajib diisi (cth: Tradisional Sasak, Seafood)'),
  specialtyDish: z.string().min(2, 'Menu andalan wajib diisi (cth: Ayam Taliwang, Plecing Kangkung)'),
  priceRange: z.string().default('Rp 25.000 - Rp 75.000'),
  minPrice: z.coerce.number().min(0).default(20000),
  maxPrice: z.coerce.number().min(0).default(100000),
  address: z.string().min(5, 'Alamat lengkap wajib diisi'),
  region: z.enum([
    'LOMBOK_SELATAN',
    'LOMBOK_UTARA',
    'LOMBOK_BARAT',
    'LOMBOK_TIMUR',
    'LOMBOK_TENGAH',
    'GILI_ISLANDS',
  ]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  openingHours: z.string().default('09:00 - 22:00 WITA'),
  coverImage: z.custom<CloudinaryAsset | string | null>().optional(),
  coverImageUrl: z.string().optional(),
  images: z.array(z.custom<CloudinaryAsset | string>()).default([]),
  isHalalCertified: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  isFeatured: z.boolean().default(false),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;
