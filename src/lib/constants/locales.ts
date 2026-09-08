/**
 * Centralized Locale Configuration for Lombok Explorer Admin CMS
 * Grounded in openapi-admin.yaml:
 * - AcceptLanguageHeader: default: id-ID, supported: id-ID, en-US
 * - *TranslationDto: locale enum: [id-ID, en-US]
 */

export const SUPPORTED_LOCALES = ['id-ID', 'en-US'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'id-ID';
export const FALLBACK_LOCALE: SupportedLocale = 'id-ID';

export interface LocaleMetadata {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  shortLabel: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export const LOCALE_METADATA: Record<SupportedLocale, LocaleMetadata> = {
  'id-ID': {
    code: 'id-ID',
    label: 'Indonesian',
    nativeLabel: 'Bahasa Indonesia',
    shortLabel: 'ID',
    flag: '🇮🇩',
    direction: 'ltr',
  },
  'en-US': {
    code: 'en-US',
    label: 'English (US)',
    nativeLabel: 'English',
    shortLabel: 'EN',
    flag: '🇺🇸',
    direction: 'ltr',
  },
};

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return typeof locale === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}
