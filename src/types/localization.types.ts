import { SupportedLocale } from '@/lib/constants/locales';

/**
 * Translation Status indicating completeness of translated entity fields
 */
export type TranslationCompleteness = 'COMPLETE' | 'INCOMPLETE' | 'MISSING';

export interface TranslationStatusInfo {
  locale: SupportedLocale;
  status: TranslationCompleteness;
  completenessPercent: number;
  missingFields: string[];
}

/**
 * OpenAPI Admin Translation Schemas (Ground truth: openapi-admin.yaml lines 5306-5407)
 */

export interface DestinationTranslationDto {
  locale: SupportedLocale;
  name: string;
  shortDescription?: string | null;
  description: string;
  address?: string | null;
}

export interface CategoryTranslationDto {
  locale: SupportedLocale;
  name: string;
  description: string;
}

export interface RestaurantTranslationDto {
  locale: SupportedLocale;
  name: string;
  description: string;
}

export interface AccommodationTranslationDto {
  locale: SupportedLocale;
  name: string;
  description: string;
}

export interface ItineraryTemplateTranslationDto {
  locale: SupportedLocale;
  title: string;
  description?: string | null;
  transportPaceNote?: string | null;
}

/**
 * Generic container for entities managing multilingual translations
 */
export interface TranslatableEntity<TTranslation> {
  translations?: TTranslation[];
}

/**
 * Helper to calculate completeness of a translation record given its required fields
 */
export function calculateTranslationStatus<T extends Record<string, any>>(
  translation: T | null | undefined,
  requiredFields: (keyof T)[]
): TranslationStatusInfo {
  if (!translation) {
    return {
      locale: 'id-ID',
      status: 'MISSING',
      completenessPercent: 0,
      missingFields: requiredFields as string[],
    };
  }

  const missing = requiredFields.filter((field) => {
    const val = translation[field];
    return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
  });

  const totalRequired = requiredFields.length;
  const completedCount = totalRequired - missing.length;
  const completenessPercent = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 100;

  let status: TranslationCompleteness = 'INCOMPLETE';
  if (missing.length === 0) {
    status = 'COMPLETE';
  } else if (missing.length === totalRequired) {
    status = 'MISSING';
  }

  return {
    locale: translation.locale || 'id-ID',
    status,
    completenessPercent,
    missingFields: missing as string[],
  };
}
