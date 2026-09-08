import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Accommodation } from '@/types/accommodation.types';
import { TranslationsDetailSection } from '@/components/localization/TranslationsDetailSection';
import { MapPin, Star, Building2, Phone, Globe, Edit2, CheckCircle2 } from 'lucide-react';

interface AccommodationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodation: Accommodation | null;
  onEdit: (acc: Accommodation) => void;
}

export function AccommodationDetailModal({
  open,
  onOpenChange,
  accommodation,
  onEdit,
}: AccommodationDetailModalProps) {
  if (!accommodation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center space-x-2">
            <StatusBadge status={accommodation.status} />
            {accommodation.isFeatured && (
              <Badge variant="default" className="text-[10px] bg-amber-500">Featured</Badge>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">{accommodation.id}</span>
        </div>
        <DialogTitle className="text-lg font-bold text-slate-900 mt-2">
          {accommodation.name}
        </DialogTitle>
        <DialogDescription>
          {accommodation.type} • {accommodation.region.replace(/_/g, ' ')}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-3 max-h-[65vh] overflow-y-auto px-1">
        {/* Cover Photo */}
        <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <img
            src={accommodation.coverImageUrl || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'}
            alt={accommodation.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Tarif Kamar Mulai</span>
            <span className="text-sm font-bold text-slate-900">
              {formatCurrency(accommodation.pricePerNight)}
              <span className="text-[10px] font-normal text-slate-500"> / malam</span>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Rating & Review</span>
            <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{accommodation.rating ? accommodation.rating.toFixed(1) : 'Baru'}</span>
              <span className="text-xs font-normal text-slate-400">({accommodation.reviewCount} ulasan)</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
            Tentang Penginapan
          </span>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
            {accommodation.description}
          </p>
        </div>

        {/* Multilingual Content Translations Section */}
        <TranslationsDetailSection
          translations={accommodation.translations}
          availableLocales={accommodation.availableLocales}
          missingLocales={accommodation.missingLocales}
          canonicalName={accommodation.name}
          canonicalDescription={accommodation.description}
          canonicalAddress={accommodation.address}
        />

        {/* Facilities */}
        {accommodation.facilities && accommodation.facilities.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
              Fasilitas Properti
            </span>
            <div className="flex flex-wrap gap-1.5">
              {accommodation.facilities.map((fac, idx) => (
                <Badge key={idx} variant="outline" className="text-[11px] bg-white">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                  {fac}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Location & Contact */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-2">
          <div className="flex items-start space-x-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="text-slate-700">{accommodation.address}</span>
          </div>
          {accommodation.contactPhone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700">{accommodation.contactPhone}</span>
            </div>
          )}
          {accommodation.websiteUrl && (
            <div className="flex items-center space-x-2">
              <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <a
                href={accommodation.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline"
              >
                {accommodation.websiteUrl}
              </a>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
          <span>Dibuat: {formatDateTime(accommodation.createdAt)}</span>
          <span>Diperbarui: {formatDateTime(accommodation.updatedAt)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button
          size="sm"
          onClick={() => {
            onOpenChange(false);
            onEdit(accommodation);
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
