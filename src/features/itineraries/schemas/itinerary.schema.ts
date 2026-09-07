import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';

export const itineraryDayActivitySchema = z.object({
  time: z.string().optional(),
  title: z.string().min(2, 'Judul aktivitas minimal 2 karakter'),
  description: z.string().optional(),
  destinationId: z.string().optional(),
  estimatedMinutes: z.coerce.number().optional(),
});

export const itineraryDaySchema = z.object({
  dayNumber: z.coerce.number().min(1),
  title: z.string().min(2, 'Judul hari wajib diisi'),
  description: z.string().optional(),
  activities: z.array(itineraryDayActivitySchema).default([]),
});

export const itinerarySchema = z.object({
  title: z.string().min(3, 'Judul itinerary minimal 3 karakter').max(150, 'Judul terlalu panjang'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  durationDays: z.coerce.number().min(1, 'Durasi minimal 1 hari').max(14, 'Durasi maksimal 14 hari'),
  estimatedCost: z.coerce.number().min(0).default(500000),
  currency: z.string().default('IDR'),
  coverImage: z.custom<CloudinaryAsset | string | null>().optional(),
  coverImageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  isFeatured: z.boolean().default(false),
  days: z.array(itineraryDaySchema).default([]),
});

export type ItineraryFormData = z.infer<typeof itinerarySchema>;
