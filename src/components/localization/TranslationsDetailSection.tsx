import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { SUPPORTED_LOCALES, SupportedLocale, LOCALE_METADATA } from '@/lib/constants/locales';
import { CheckCircle2, AlertCircle, Languages, Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface GenericTranslationItem {
  locale: string;
  name?: string;
  title?: string;
  description?: string | null;
  shortDescription?: string | null;
  address?: string | null;
  transportPaceNote?: string | null;
  [key: string]: any;
}

interface TranslationsDetailSectionProps {
  translations?: GenericTranslationItem[];
  availableLocales?: string[];
  missingLocales?: string[];
  canonicalName?: string;
  canonicalTitle?: string;
  canonicalDescription?: string;
  canonicalAddress?: string;
  canonicalShortDescription?: string;
  canonicalTransportPaceNote?: string;
  className?: string;
}

export function TranslationsDetailSection({
  translations,
  availableLocales,
  missingLocales,
  canonicalName,
  canonicalTitle,
  canonicalDescription,
  canonicalAddress,
  canonicalShortDescription,
  canonicalTransportPaceNote,
  className,
}: TranslationsDetailSectionProps) {
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>('id-ID');

  // Compute effective translations list
  // If translations array is provided and has items, use it.
  // Fallback: If id-ID translation is not explicitly in translations array but canonical data exists, synthesize id-ID translation.
  const effectiveTranslations: GenericTranslationItem[] = [];

  if (Array.isArray(translations) && translations.length > 0) {
    translations.forEach((t) => effectiveTranslations.push(t));
  }

  // Ensure id-ID is present if canonical fields exist
  const hasIdTranslation = effectiveTranslations.some((t) => t.locale === 'id-ID');
  if (!hasIdTranslation && (canonicalName || canonicalTitle || canonicalDescription)) {
    effectiveTranslations.push({
      locale: 'id-ID',
      name: canonicalName,
      title: canonicalTitle,
      description: canonicalDescription,
      shortDescription: canonicalShortDescription,
      address: canonicalAddress,
      transportPaceNote: canonicalTransportPaceNote,
    });
  }

  // Derive available and missing locales from props or translation array
  const effectiveAvailable: string[] = availableLocales && availableLocales.length > 0
    ? availableLocales
    : effectiveTranslations.map((t) => t.locale);

  const effectiveMissing: string[] = missingLocales !== undefined
    ? missingLocales
    : SUPPORTED_LOCALES.filter((loc) => !effectiveAvailable.includes(loc));

  const currentTranslation = effectiveTranslations.find((t) => t.locale === selectedLocale);
  const isSelectedMissing = effectiveMissing.includes(selectedLocale) || !currentTranslation;

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-4 space-y-3.5', className)}>
      {/* Header & Locales Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Konten Multilingual (Translations)
            </h4>
            <p className="text-[11px] text-slate-500">
              Data terjemahan bahasa sesuai kontrak backend OpenAPI
            </p>
          </div>
        </div>

        {/* Locale Availability Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SUPPORTED_LOCALES.map((loc) => {
            const meta = LOCALE_METADATA[loc];
            const isAvail = effectiveAvailable.includes(loc);
            return (
              <Badge
                key={loc}
                variant={isAvail ? 'outline' : 'secondary'}
                className={cn(
                  'text-[11px] px-2 py-0.5 font-medium flex items-center space-x-1',
                  isAvail
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-100 text-slate-400'
                )}
              >
                <span>{meta.flag}</span>
                <span>{meta.nativeLabel}</span>
                {isAvail ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                )}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Tabs to switch language preview */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
        {SUPPORTED_LOCALES.map((loc) => {
          const meta = LOCALE_METADATA[loc];
          const isAvail = effectiveAvailable.includes(loc);
          const isSelected = selectedLocale === loc;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => setSelectedLocale(loc)}
              className={cn(
                'flex-1 py-1 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1.5',
                isSelected
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <span>{meta.flag}</span>
              <span>{meta.label}</span>
              {!isAvail && (
                <span className="text-[10px] text-amber-600 font-normal ml-1">(Belum Ada)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Translation Content Display */}
      {isSelectedMissing || !currentTranslation ? (
        <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200/80 text-center space-y-1.5">
          <AlertCircle className="h-5 w-5 text-amber-600 mx-auto" />
          <p className="text-xs font-semibold text-amber-900">
            Terjemahan {LOCALE_METADATA[selectedLocale].label} belum tersedia
          </p>
          <p className="text-[11px] text-amber-700">
            Konten ini belum memiliki terjemahan untuk bahasa {LOCALE_METADATA[selectedLocale].nativeLabel}. Klik tombol Edit Data untuk menambahkan terjemahan.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-1 text-xs">
          {/* Title or Name */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              {currentTranslation.title !== undefined ? 'Judul (Title)' : 'Nama (Name)'} [{selectedLocale}]
            </span>
            <span className="font-semibold text-slate-800 text-sm">
              {currentTranslation.name || currentTranslation.title || '-'}
            </span>
          </div>

          {/* Short Description if available */}
          {currentTranslation.shortDescription && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Deskripsi Singkat (Short Description)
              </span>
              <p className="text-slate-700 leading-relaxed">
                {currentTranslation.shortDescription}
              </p>
            </div>
          )}

          {/* Description */}
          {currentTranslation.description && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Deskripsi Lengkap (Full Description)
              </span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {currentTranslation.description}
              </p>
            </div>
          )}

          {/* Address if available */}
          {currentTranslation.address && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Alamat Terjemahan (Address)
              </span>
              <p className="text-slate-700">
                {currentTranslation.address}
              </p>
            </div>
          )}

          {/* Transport Pace Note if available */}
          {currentTranslation.transportPaceNote && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Catatan Ritme Transportasi (Transport Pace Note)
              </span>
              <p className="text-slate-700">
                {currentTranslation.transportPaceNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
