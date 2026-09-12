import { z } from 'zod';
import { CloudinaryAsset } from '@/types/upload.types';
import { ItineraryTemplateTranslationDto } from '@/types/localization.types';

export const itineraryDayActivitySchema = z.object({
  itemType: z.enum(['DESTINATION', 'RESTAURANT', 'ACCOMMODATION', 'CUSTOM']).default('DESTINATION'),
  destinationId: z.string().optional().nullable(),
  restaurantId: z.string().optional().nullable(),
  accommodationId: z.string().optional().nullable(),
  customTitle: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  estimatedDurationMinutes: z.coerce.number().default(60),
  estimatedCost: z.coerce.number().default(0),
  activityNotes: z.string().optional().nullable(),
});

export const itineraryDaySchema = z.object({
  dayNumber: z.coerce.number().min(1),
  title: z.string().min(2, 'Judul hari wajib diisi'),
  description: z.string().optional(),
  activities: z.array(itineraryDayActivitySchema).default([]),
});

export const itineraryTranslationSchema = z.object({
  locale: z.enum(['id-ID', 'en-US']),
  title: z.string().min(3, 'Judul itinerary minimal 3 karakter').max(150),
  description: z.string().optional().nullable(),
  transportPaceNote: z.string().optional().nullable(),
});

export const itinerarySchema = z
  .object({
    // Primary / id-ID fields (Required canonical data)
    title: z.string().min(3, 'Bahasa Indonesia → Judul itinerary minimal 3 karakter').max(150, 'Judul terlalu panjang'),
    slug: z.string().optional(),
    description: z.string().min(10, 'Bahasa Indonesia → Deskripsi minimal 10 karakter'),
    transportPaceNote: z.string().optional(),

    // English / en-US fields (Optional unless partially entered)
    en_title: z.string().optional(),
    en_description: z.string().optional(),
    en_transportPaceNote: z.string().optional(),

    // Shared fields
    travelStyle: z.string().default('BEACH_RELAXATION'),
    budgetLevel: z.string().default('MID_RANGE'),
    transportationMode: z.string().default('CAR'),
    durationDays: z.coerce.number().min(1, 'Durasi minimal 1 hari').max(14, 'Durasi maksimal 14 hari'),
    estimatedCost: z.coerce.number().min(0).default(500000),
    currency: z.string().default('IDR'),
    coverImage: z.custom<CloudinaryAsset | string | null>().optional(),
    coverImageUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    isFeatured: z.boolean().default(false),
    days: z.array(itineraryDaySchema).default([]),
    translations: z.array(itineraryTranslationSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const hasAnyEn = Boolean(
      (data.en_title && data.en_title.trim().length > 0) ||
      (data.en_description && data.en_description.trim().length > 0) ||
      (data.en_transportPaceNote && data.en_transportPaceNote.trim().length > 0)
    );

    if (hasAnyEn) {
      if (!data.en_title || data.en_title.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'English → Template title is required (min 3 characters)',
          path: ['en_title'],
        });
      }
    }
  });

export type ItineraryFormData = z.infer<typeof itinerarySchema>;

export function buildItineraryTranslations(data: ItineraryFormData): ItineraryTemplateTranslationDto[] {
  const list: ItineraryTemplateTranslationDto[] = [
    {
      locale: 'id-ID',
      title: data.title,
      description: data.description || null,
      transportPaceNote: data.transportPaceNote || null,
    },
  ];

  if (data.en_title) {
    list.push({
      locale: 'en-US',
      title: data.en_title,
      description: data.en_description || null,
      transportPaceNote: data.en_transportPaceNote || null,
    });
  }

  return list;
}
