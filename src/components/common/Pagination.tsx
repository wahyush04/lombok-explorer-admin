import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/types/api.types';

interface PaginationProps {
  meta?: PaginationMeta | { page: number; totalPages: number; total: number; limit: number };
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = meta;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200">
      <div className="text-xs text-slate-500">
        Menampilkan <span className="font-medium text-slate-900">{total > 0 ? startItem : 0}</span> sampai{' '}
        <span className="font-medium text-slate-900">{endItem}</span> dari{' '}
        <span className="font-medium text-slate-900">{total}</span> data
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-2.5 text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Sebelumnya
        </Button>
        <span className="text-xs font-medium px-3 text-slate-700">
          Hal {page} dari {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-2.5 text-xs"
        >
          Selanjutnya
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
