import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'Tidak ada data ditemukan',
  description = 'Belum ada data yang tersedia untuk filter atau pencarian ini.',
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="p-3 bg-white rounded-full text-slate-400 shadow-xs border border-slate-100 mb-3">
        {icon || <FolderOpen className="h-7 w-7" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionText}
        </Button>
      )}
    </div>
  );
}
