import React from 'react';
import { SUPPORTED_LOCALES, SupportedLocale, LOCALE_METADATA } from '@/lib/constants/locales';
import { TranslationCompleteness } from '@/types/localization.types';
import { TranslationStatusBadge } from './TranslationStatusBadge';
import { cn } from '@/lib/utils/cn';
import { Globe } from 'lucide-react';

interface LocaleTabsProps {
  activeLocale: SupportedLocale;
  onLocaleChange: (locale: SupportedLocale) => void;
  statusMap?: Partial<Record<SupportedLocale, TranslationCompleteness>>;
  completenessPercentMap?: Partial<Record<SupportedLocale, number>>;
  disabled?: boolean;
  className?: string;
}

export function LocaleTabs({
  activeLocale,
  onLocaleChange,
  statusMap,
  completenessPercentMap,
  disabled = false,
  className,
}: LocaleTabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % SUPPORTED_LOCALES.length;
      onLocaleChange(SUPPORTED_LOCALES[nextIndex]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + SUPPORTED_LOCALES.length) % SUPPORTED_LOCALES.length;
      onLocaleChange(SUPPORTED_LOCALES[prevIndex]);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="tablist"
        aria-label="Bahasa Konten / Content Language"
        className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80 w-fit"
      >
        <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-500 mr-1 select-none">
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Bahasa:</span>
        </div>

        {SUPPORTED_LOCALES.map((locale, idx) => {
          const meta = LOCALE_METADATA[locale];
          const isActive = activeLocale === locale;
          const status = statusMap?.[locale];
          const percent = completenessPercentMap?.[locale];

          return (
            <button
              key={locale}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${locale}`}
              id={`tab-${locale}`}
              tabIndex={isActive ? 0 : -1}
              disabled={disabled}
              onClick={() => onLocaleChange(locale)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-sm leading-none" role="img" aria-label={meta.label}>
                {meta.flag}
              </span>
              <span>{meta.nativeLabel}</span>
              {status && (
                <TranslationStatusBadge status={status} completenessPercent={percent} size="sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
