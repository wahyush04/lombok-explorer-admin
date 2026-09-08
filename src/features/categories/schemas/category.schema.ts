import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';
import { CategoryTranslationDto } from '@/types/localization.types';

export const categoryTranslationSchema = z.object({
  locale: z.enum(['id-ID', 'en-US']),
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(80, 'Nama terlalu panjang'),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
});

export const categorySchema = z
  .object({
    // Primary / id-ID fields (Required canonical data)
    name: z.string().min(2, 'Bahasa Indonesia → Nama kategori minimal 2 karakter').max(80, 'Nama terlalu panjang'),
    slug: z.string().optional(),
    description: z.string().min(5, 'Bahasa Indonesia → Deskripsi minimal 5 karakter'),

    // English / en-US fields (Optional unless partially entered)
    en_name: z.string().optional(),
    en_description: z.string().optional(),

    // Shared fields
    iconName: z.string().min(1, 'Nama ikon wajib diisi (contoh: waves, mountain, landmark, droplets)'),
    coverImage: z.custom<CloudinaryAsset | string | null>().optional(),
    coverImageUrl: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    translations: z.array(categoryTranslationSchema).optional(),
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
          message: 'English → Category name is required (min 2 characters)',
          path: ['en_name'],
        });
      }
      if (!data.en_description || data.en_description.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'English → Description is required (min 5 characters)',
          path: ['en_description'],
        });
      }
    }
  });

export type CategoryFormData = z.infer<typeof categorySchema>;

export function buildCategoryTranslations(data: CategoryFormData): CategoryTranslationDto[] {
  const list: CategoryTranslationDto[] = [
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
