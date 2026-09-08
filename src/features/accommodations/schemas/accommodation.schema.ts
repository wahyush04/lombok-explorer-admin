import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';
import { AccommodationTranslationDto } from '@/types/localization.types';

export const accommodationTranslationSchema = z.object({
  locale: z.enum(['id-ID', 'en-US']),
  name: z.string().min(3, 'Nama akomodasi minimal 3 karakter').max(150, 'Nama terlalu panjang'),
  description: z.string().min(10, 'Deskripsi akomodasi minimal 10 karakter'),
});

export const accommodationSchema = z
  .object({
    // Primary / id-ID fields (Required canonical data)
    name: z.string().min(3, 'Bahasa Indonesia → Nama akomodasi minimal 3 karakter').max(150, 'Nama terlalu panjang'),
    slug: z.string().optional(),
    description: z.string().min(10, 'Bahasa Indonesia → Deskripsi akomodasi minimal 10 karakter'),

    // English / en-US fields (Optional unless partially entered)
    en_name: z.string().optional(),
    en_description: z.string().optional(),

    // Shared fields
    type: z.string().min(2, 'Tipe akomodasi wajib diisi (cth: Resort Bintang 5, Villa Mewah, Hotel Butik)'),
    pricePerNight: z.coerce.number().min(0, 'Harga per malam minimal 0'),
    currency: z.string().default('IDR'),
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
    coverImage: z.custom<CloudinaryAsset | string | null>().optional(),
    coverImageUrl: z.string().optional(),
    images: z.array(z.custom<CloudinaryAsset | string>()).default([]),
    facilities: z.array(z.string()).default([]),
    amenities: z.array(z.string()).default([]),
    contactPhone: z.string().optional(),
    websiteUrl: z.string().url('URL website harus valid').optional().or(z.literal('')),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    isFeatured: z.boolean().default(false),
    translations: z.array(accommodationTranslationSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const hasAnyEn = Boolean(
      (data.en_name && data.en_name.trim().length > 0) ||
      (data.en_description && data.en_description.trim().length > 0)
    );

    if (hasAnyEn) {
      if (!data.en_name || data.en_name.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'English → Accommodation name is required (min 3 characters)',
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

export type AccommodationFormData = z.infer<typeof accommodationSchema>;

export function buildAccommodationTranslations(data: AccommodationFormData): AccommodationTranslationDto[] {
  const list: AccommodationTranslationDto[] = [
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
