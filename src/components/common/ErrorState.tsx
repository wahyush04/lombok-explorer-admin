import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Gagal memuat data',
  message = 'Terjadi kendala saat mengambil data dari server. Silakan coba kembali.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-200 bg-rose-50/40">
      <div className="p-3 bg-white rounded-full text-rose-500 shadow-xs border border-rose-100 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
      <p className="text-xs text-rose-600/90 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4 border-rose-200 text-rose-700 hover:bg-rose-100/50">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
