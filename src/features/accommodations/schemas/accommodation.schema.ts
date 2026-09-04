import { z } from 'zod';

export const accommodationSchema = z.object({
  name: z.string().min(3, 'Nama akomodasi minimal 3 karakter').max(150, 'Nama terlalu panjang'),
  slug: z.string().optional(),
  type: z.string().min(2, 'Tipe akomodasi wajib diisi (cth: Resort Bintang 5, Villa Mewah, Hotel Butik)'),
  description: z.string().min(10, 'Deskripsi akomodasi minimal 10 karakter'),
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
  coverImageUrl: z.string().url('URL gambar sampul harus valid'),
  facilities: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url('URL website harus valid').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  isFeatured: z.boolean().default(false),
});

export type AccommodationFormData = z.infer<typeof accommodationSchema>;
