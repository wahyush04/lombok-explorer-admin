import React from 'react';
import { TranslationCompleteness } from '@/types/localization.types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { CheckCircle2, AlertCircle, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TranslationStatusBadgeProps {
  status: TranslationCompleteness;
  completenessPercent?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function TranslationStatusBadge({
  status,
  completenessPercent,
  className,
  size = 'sm',
}: TranslationStatusBadgeProps) {
  const { t } = useTranslation();

  const config = {
    COMPLETE: {
      label: t.localization.complete,
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconStyle: 'text-emerald-500',
    },
    INCOMPLETE: {
      label: t.localization.incomplete,
      icon: AlertCircle,
      style: 'bg-amber-50 text-amber-700 border-amber-200',
      iconStyle: 'text-amber-500',
    },
    MISSING: {
      label: t.localization.missing,
      icon: CircleDashed,
      style: 'bg-slate-50 text-slate-500 border-slate-200 border-dashed',
      iconStyle: 'text-slate-400',
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.style,
        className
      )}
      title={`${t.localization.translationStatus}: ${config.label}${
        completenessPercent !== undefined ? ` (${completenessPercent}%)` : ''
      }`}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5', config.iconStyle)} />
      <span>{config.label}</span>
      {completenessPercent !== undefined && status === 'INCOMPLETE' && (
        <span className="text-[10px] opacity-75">({completenessPercent}%)</span>
      )}
    </span>
  );
}
