import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';

export const categorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(80, 'Nama terlalu panjang'),
  slug: z.string().optional(),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  iconName: z.string().min(1, 'Nama ikon wajib diisi (contoh: waves, mountain, landmark, droplets)'),
  coverImage: z.custom<CloudinaryAsset | string | null>().optional(),
  coverImageUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
