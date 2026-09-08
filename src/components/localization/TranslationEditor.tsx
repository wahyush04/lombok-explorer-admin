import React, { useState } from 'react';
import { SupportedLocale } from '@/lib/constants/locales';
import { TranslationCompleteness } from '@/types/localization.types';
import { LocaleTabs } from './LocaleTabs';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PlusCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TranslationEditorProps {
  currentLocale: SupportedLocale;
  onLocaleChange: (locale: SupportedLocale) => void;
  statusMap?: Partial<Record<SupportedLocale, TranslationCompleteness>>;
  completenessPercentMap?: Partial<Record<SupportedLocale, number>>;
  hasUnsavedChanges?: boolean;
  onAddTranslation?: (locale: SupportedLocale) => void;
  children: (locale: SupportedLocale) => React.ReactNode;
  className?: string;
}

export function TranslationEditor({
  currentLocale,
  onLocaleChange,
  statusMap,
  completenessPercentMap,
  hasUnsavedChanges = false,
  onAddTranslation,
  children,
  className,
}: TranslationEditorProps) {
  const { t } = useTranslation();
  const [pendingLocale, setPendingLocale] = useState<SupportedLocale | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  const handleTabChange = (nextLocale: SupportedLocale) => {
    if (nextLocale === currentLocale) return;

    if (hasUnsavedChanges) {
      setPendingLocale(nextLocale);
      setShowUnsavedConfirm(true);
    } else {
      onLocaleChange(nextLocale);
    }
  };

  const handleConfirmSwitch = () => {
    if (pendingLocale) {
      onLocaleChange(pendingLocale);
      setPendingLocale(null);
    }
    setShowUnsavedConfirm(false);
  };

  const isCurrentLocaleMissing = statusMap?.[currentLocale] === 'MISSING';

  return (
    <div className={`space-y-4 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 ${className || ''}`}>
      {/* Header with Locale Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t.localization.translations}
          </h4>
          <p className="text-[11px] text-slate-500">
            {currentLocale === 'id-ID'
              ? t.localization.sourceLocaleNote
              : t.localization.targetLocaleNote}
          </p>
        </div>

        <LocaleTabs
          activeLocale={currentLocale}
          onLocaleChange={handleTabChange}
          statusMap={statusMap}
          completenessPercentMap={completenessPercentMap}
        />
      </div>

      {/* Missing Translation State Prompt */}
      {isCurrentLocaleMissing && currentLocale !== 'id-ID' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900">
          <div className="flex items-center gap-2 text-xs">
            <Info className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{t.localization.noEnglishTranslationYet}</span>
          </div>
          {onAddTranslation && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddTranslation(currentLocale)}
              className="h-7 text-xs border-amber-300 bg-white hover:bg-amber-100 text-amber-800 shrink-0 gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{t.localization.addTranslation}</span>
            </Button>
          )}
        </div>
      )}

      {/* Form Fields for Active Locale */}
      <div
        role="tabpanel"
        id={`tabpanel-${currentLocale}`}
        aria-labelledby={`tab-${currentLocale}`}
        className="space-y-4"
      >
        {children(currentLocale)}
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <ConfirmDialog
        open={showUnsavedConfirm}
        onOpenChange={setShowUnsavedConfirm}
        title={t.localization.unsavedChangesTitle}
        description={t.localization.unsavedChangesDesc}
        confirmText={t.localization.unsavedChangesConfirm}
        cancelText={t.localization.unsavedChangesCancel}
        onConfirm={handleConfirmSwitch}
      />
    </div>
  );
}
