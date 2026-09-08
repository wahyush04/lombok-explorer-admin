import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';
import { RestaurantTranslationDto } from '@/types/localization.types';

export const restaurantTranslationSchema = z.object({
  locale: z.enum(['id-ID', 'en-US']),
  name: z.string().min(2, 'Nama restoran minimal 2 karakter').max(150, 'Nama terlalu panjang'),
  description: z.string().min(10, 'Deskripsi restoran minimal 10 karakter'),
});

export const restaurantSchema = z
  .object({
    // Primary / id-ID fields (Required canonical data)
    name: z.string().min(2, 'Bahasa Indonesia → Nama restoran minimal 2 karakter').max(150, 'Nama terlalu panjang'),
    slug: z.string().optional(),
    description: z.string().min(10, 'Bahasa Indonesia → Deskripsi restoran minimal 10 karakter'),

    // English / en-US fields (Optional unless partially entered)
    en_name: z.string().optional(),
    en_description: z.string().optional(),

    // Shared fields
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
    translations: z.array(restaurantTranslationSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const hasAnyEn = Boolean(
      (data.en_name && data.en_name.trim().length > 0) ||
      (data.en_description && data.en_description.trim().length > 0)
    );

    if (hasAnyEn) {
      if (!data.en_name || data.en_name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'English → Restaurant name is required (min 2 characters)',
          path: ['en_name'],
        });
      }
      if (!data.en_description || data.en_description.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'English → Description is required (min 10 characters)',
          path: ['en_description'],
        });
      }
    }
  });

export type RestaurantFormData = z.infer<typeof restaurantSchema>;

export function buildRestaurantTranslations(data: RestaurantFormData): RestaurantTranslationDto[] {
  const list: RestaurantTranslationDto[] = [
    {
      locale: 'id-ID',
      name: data.name,
      description: data.description,
    },
  ];

  if (data.en_name && data.en_description) {
    list.push({
      locale: 'en-US',
      name: data.en_name,
      description: data.en_description,
    });
  }

  return list;
}
