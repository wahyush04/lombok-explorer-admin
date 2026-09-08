import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Destination } from '@/types/destination.types';
import { TranslationsDetailSection } from '@/components/localization/TranslationsDetailSection';
import {
  MapPin,
  Clock,
  DollarSign,
  Tag,
  Star,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';

interface DestinationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: Destination | null;
  onEdit: (dst: Destination) => void;
  onManageGallery: (dst: Destination) => void;
}

export function DestinationDetailModal({
  open,
  onOpenChange,
  destination,
  onEdit,
  onManageGallery,
}: DestinationDetailModalProps) {
  if (!destination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center space-x-2">
            <StatusBadge status={destination.status} />
            {destination.isFeatured && (
              <Badge variant="default" className="text-[10px] bg-amber-500">
                <Star className="h-3 w-3 mr-1 fill-white" /> Featured
              </Badge>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">{destination.id}</span>
        </div>
        <DialogTitle className="text-lg font-bold text-slate-900 mt-2">
          {destination.name}
        </DialogTitle>
        <DialogDescription>
          {destination.categoryName || 'Wisata'} • {destination.region.replace(/_/g, ' ')}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-3 max-h-[70vh] overflow-y-auto px-1">
        {/* Cover Photo Banner */}
        <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <img
            src={destination.coverImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62'}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs flex items-center space-x-2">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span>{destination.locationName}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Rating Wisatawan</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-800">
                {destination.rating ? destination.rating.toFixed(1) : 'Baru'}
              </span>
              <span className="text-xs text-slate-400">({destination.reviewCount} ulasan)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Tiket Masuk</span>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {destination.ticketPrice || destination.entranceFee
                ? formatCurrency(destination.ticketPrice || destination.entranceFee || 0)
                : 'Gratis'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Jam Buka</span>
            <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
              {destination.openingHours || '08:00 - 18:00 WITA'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Kesulitan / Durasi</span>
            <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
              {destination.difficulty || 'EASY'} • {destination.estimatedDurationMinutes || 120} mnt
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Deskripsi Destinasi
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/75 p-3 rounded-lg border border-slate-100">
            {destination.description || 'Tidak ada deskripsi rinci.'}
          </p>
        </div>

        {/* Multilingual Content Translations Section */}
        <TranslationsDetailSection
          translations={destination.translations}
          availableLocales={destination.availableLocales}
          missingLocales={destination.missingLocales}
          canonicalName={destination.name}
          canonicalDescription={destination.description}
          canonicalShortDescription={destination.shortDescription}
          canonicalAddress={destination.address || undefined}
        />

        {/* Location & Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-semibold text-slate-700 block mb-1">Alamat Fisik:</span>
            <p className="text-slate-600">{destination.address || destination.locationName}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-semibold text-slate-700 block mb-1">Koordinat Geografis:</span>
            <p className="text-slate-600 font-mono">
              Lat: {destination.latitude}, Lng: {destination.longitude}
            </p>
          </div>
        </div>

        {/* Facilities & Tags */}
        <div className="space-y-3">
          {destination.facilities && destination.facilities.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                Fasilitas Tersedia
              </span>
              <div className="flex flex-wrap gap-1.5">
                {destination.facilities.map((fac, idx) => (
                  <Badge key={idx} variant="outline" className="text-[11px] bg-white">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                    {fac}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {destination.tags && destination.tags.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                Label / Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {destination.tags.map((t, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[11px]">
                    <Tag className="h-3 w-3 mr-1" />
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata timestamps */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dibuat: {formatDateTime(destination.createdAt)}</span>
          <span>Diperbarui: {formatDateTime(destination.updatedAt)}</span>
        </div>
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onOpenChange(false);
            onManageGallery(destination);
          }}
          className="text-xs"
        >
          <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
          Kelola Galeri Foto
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onEdit(destination);
            }}
            className="text-xs"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Edit Data
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Tutup
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
