import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Restaurant } from '@/types/restaurant.types';
import { MapPin, Star, Utensils, CheckCircle2, Edit2 } from 'lucide-react';

interface RestaurantDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant | null;
  onEdit: (rest: Restaurant) => void;
}

export function RestaurantDetailModal({
  open,
  onOpenChange,
  restaurant,
  onEdit,
}: RestaurantDetailModalProps) {
  if (!restaurant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center space-x-2">
            <StatusBadge status={restaurant.status} />
            {restaurant.isHalalCertified && (
              <Badge variant="success" className="text-[10px]">Halal</Badge>
            )}
            {restaurant.isFeatured && (
              <Badge variant="default" className="text-[10px] bg-amber-500">Featured</Badge>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">{restaurant.id}</span>
        </div>
        <DialogTitle className="text-lg font-bold text-slate-900 mt-2">
          {restaurant.name}
        </DialogTitle>
        <DialogDescription>
          {restaurant.cuisineType} • {restaurant.region.replace(/_/g, ' ')}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-3 max-h-[65vh] overflow-y-auto px-1">
        {/* Cover Photo */}
        <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <img
            src={restaurant.coverImageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Rating Wisatawan</span>
            <div className="flex items-center space-x-1 font-bold text-slate-800">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating ? restaurant.rating.toFixed(1) : 'Baru'}</span>
              <span className="text-slate-400 font-normal">({restaurant.reviewCount})</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Rentang Harga</span>
            <div className="font-bold text-slate-800 truncate">
              {restaurant.priceRange || `${formatCurrency(restaurant.minPrice || 0)} - ${formatCurrency(restaurant.maxPrice || 0)}`}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-slate-400 block mb-0.5">Jam Buka</span>
            <div className="font-semibold text-slate-800 truncate">
              {restaurant.openingHours || '09:00 - 22:00 WITA'}
            </div>
          </div>
        </div>

        {/* Specialty Dish */}
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-start space-x-2.5">
          <Utensils className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-emerald-900 block">Menu Andalan:</span>
            <p className="text-xs text-emerald-800">{restaurant.specialtyDish}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
            Deskripsi Kuliner
          </span>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
            {restaurant.description}
          </p>
        </div>

        {/* Address & Coordinates */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
          <div className="flex items-start space-x-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="text-slate-700">{restaurant.address}</span>
          </div>
          <p className="text-[11px] text-slate-400 pl-5 font-mono">
            Lat: {restaurant.latitude}, Long: {restaurant.longitude}
          </p>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
          <span>Dibuat: {formatDateTime(restaurant.createdAt)}</span>
          <span>Diperbarui: {formatDateTime(restaurant.updatedAt)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button
          size="sm"
          onClick={() => {
            onOpenChange(false);
            onEdit(restaurant);
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
