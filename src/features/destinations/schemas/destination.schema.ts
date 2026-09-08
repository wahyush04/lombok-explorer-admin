import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';
import { DestinationTranslationDto } from '@/types/localization.types';

export const destinationTranslationSchema = z.object({
  locale: z.enum(['id-ID', 'en-US']),
  name: z.string().min(3, 'Nama destinasi minimal 3 karakter').max(150, 'Nama terlalu panjang'),
  shortDescription: z.string().max(250, 'Maksimal 250 karakter').optional().nullable(),
  description: z.string().min(10, 'Deskripsi lengkap minimal 10 karakter'),
  address: z.string().optional().nullable(),
});

export const destinationSchema = z
  .object({
    // Primary / id-ID fields (Required canonical data)
    name: z.string().min(3, 'Bahasa Indonesia → Nama destinasi minimal 3 karakter').max(150, 'Nama terlalu panjang'),
    slug: z.string().optional(),
    shortDescription: z.string().max(250, 'Maksimal 250 karakter').optional(),
    description: z.string().min(10, 'Bahasa Indonesia → Deskripsi lengkap minimal 10 karakter'),
    address: z.string().optional(),

    // English / en-US fields (Optional unless partially entered)
    en_name: z.string().optional(),
    en_shortDescription: z.string().optional(),
    en_description: z.string().optional(),
    en_address: z.string().optional(),

    // Shared non-translatable fields
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
    translations: z.array(destinationTranslationSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // If English name is provided, description must also be provided
    const hasAnyEn = Boolean(
      (data.en_name && data.en_name.trim().length > 0) ||
      (data.en_description && data.en_description.trim().length > 0) ||
      (data.en_shortDescription && data.en_shortDescription.trim().length > 0) ||
      (data.en_address && data.en_address.trim().length > 0)
    );

    if (hasAnyEn) {
      if (!data.en_name || data.en_name.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'English → Destination name is required (min 3 characters)',
          path: ['en_name'],
        });
      }
      if (!data.en_description || data.en_description.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'English → Full description is required (min 10 characters)',
          path: ['en_description'],
        });
      }
    }
  });

export type DestinationFormData = z.infer<typeof destinationSchema>;

/**
 * Helper to build DestinationTranslationDto array from form data
 */
export function buildDestinationTranslations(data: DestinationFormData): DestinationTranslationDto[] {
  const list: DestinationTranslationDto[] = [
    {
      locale: 'id-ID',
      name: data.name,
      shortDescription: data.shortDescription || null,
      description: data.description,
      address: data.address || null,
    },
  ];

  if (data.en_name && data.en_description) {
    list.push({
      locale: 'en-US',
      name: data.en_name,
      shortDescription: data.en_shortDescription || null,
      description: data.en_description,
      address: data.en_address || null,
    });
  }

  return list;
}
