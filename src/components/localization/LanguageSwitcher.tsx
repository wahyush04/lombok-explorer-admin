import React from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { SUPPORTED_LOCALES, LOCALE_METADATA, SupportedLocale } from '@/lib/constants/locales';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function LanguageSwitcher({ className, variant = 'compact' }: LanguageSwitcherProps) {
  const { uiLocale, setUiLocale, t } = useTranslation();

  const handleToggle = (locale: SupportedLocale) => {
    setUiLocale(locale);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1',
        className
      )}
      title={t.localization.adminLanguage}
    >
      <div className="flex items-center px-1.5 text-slate-400">
        <Globe className="h-3.5 w-3.5" />
      </div>

      {SUPPORTED_LOCALES.map((locale) => {
        const meta = LOCALE_METADATA[locale];
        const isActive = uiLocale === locale;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleToggle(locale)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all',
              isActive
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            )}
            aria-label={`${t.localization.adminLanguage}: ${meta.label}`}
            aria-pressed={isActive}
          >
            <span role="img" aria-hidden="true" className="text-xs leading-none">
              {meta.flag}
            </span>
            <span>{variant === 'full' ? meta.nativeLabel : meta.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
