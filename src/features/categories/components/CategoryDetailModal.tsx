import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils/format';
import { Category } from '@/types/category.types';
import { TranslationsDetailSection } from '@/components/localization/TranslationsDetailSection';
import {
  Edit2,
  Waves,
  Mountain,
  Landmark,
  Droplets,
  Sun,
  Compass,
  FolderTree,
} from 'lucide-react';

interface CategoryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onEdit: (cat: Category) => void;
}

export function CategoryDetailModal({
  open,
  onOpenChange,
  category,
  onEdit,
}: CategoryDetailModalProps) {
  if (!category) return null;

  const renderIcon = (iconName?: string) => {
    switch ((iconName || '').toLowerCase()) {
      case 'mountain':
        return <Mountain className="h-5 w-5 text-emerald-600" />;
      case 'landmark':
        return <Landmark className="h-5 w-5 text-amber-600" />;
      case 'droplets':
        return <Droplets className="h-5 w-5 text-blue-600" />;
      case 'sun':
        return <Sun className="h-5 w-5 text-yellow-600" />;
      case 'compass':
        return <Compass className="h-5 w-5 text-teal-600" />;
      default:
        return <Waves className="h-5 w-5 text-cyan-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center space-x-2">
            <StatusBadge status={category.status} />
            <Badge variant="outline" className="text-[10px] font-mono">
              {category.slug}
            </Badge>
          </div>
          <span className="text-xs text-slate-400 font-mono">{category.id}</span>
        </div>
        <div className="flex items-center space-x-2.5 mt-2">
          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            {renderIcon(category.iconName)}
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {category.name}
            </DialogTitle>
            <DialogDescription>
              {category.destinationsCount ?? 0} destinasi terhubung
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-3 max-h-[65vh] overflow-y-auto px-1">
        {/* Cover Photo */}
        {category.coverImageUrl && (
          <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src={category.coverImageUrl}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
            Deskripsi Kategori
          </span>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Multilingual Content Translations Section */}
        <TranslationsDetailSection
          translations={category.translations}
          availableLocales={category.availableLocales}
          missingLocales={category.missingLocales}
          canonicalName={category.name}
          canonicalDescription={category.description}
        />

        {/* Metadata timestamps */}
        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
          <span>Dibuat: {formatDateTime(category.createdAt)}</span>
          <span>Diperbarui: {formatDateTime(category.updatedAt)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button
          size="sm"
          onClick={() => {
            onOpenChange(false);
            onEdit(category);
          }}
          className="text-xs"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
          Edit Data
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
          Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
