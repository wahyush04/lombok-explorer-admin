import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { ItineraryTemplate } from '@/types/itinerary.types';
import { Calendar, Clock, DollarSign, Star, Edit2, Tag } from 'lucide-react';

interface ItineraryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itinerary: ItineraryTemplate | null;
  onEdit: (itn: ItineraryTemplate) => void;
}

export function ItineraryDetailModal({
  open,
  onOpenChange,
  itinerary,
  onEdit,
}: ItineraryDetailModalProps) {
  if (!itinerary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center space-x-2">
            <StatusBadge status={itinerary.status} />
            {itinerary.isFeatured && (
              <Badge variant="default" className="text-[10px] bg-amber-500">Featured</Badge>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">{itinerary.id}</span>
        </div>
        <DialogTitle className="text-lg font-bold text-slate-900 mt-2">
          {itinerary.title}
        </DialogTitle>
        <DialogDescription>
          Paket {itinerary.durationDays} Hari Perjalanan • Estimasi {formatCurrency(itinerary.estimatedCost || 0)}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-3 max-h-[65vh] overflow-y-auto px-1">
        {/* Cover */}
        <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <img
            src={itinerary.coverImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62'}
            alt={itinerary.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
            Deskripsi Paket
          </span>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
            {itinerary.description}
          </p>
        </div>

        {/* Day-by-Day Activities */}
        {itinerary.days && itinerary.days.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Rincian Hari demi Hari
            </span>
            <div className="space-y-2">
              {itinerary.days.map((day) => (
                <div key={day.dayNumber} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="font-bold text-emerald-800 block">
                    Hari ke-{day.dayNumber}: {day.title}
                  </span>
                  {day.description && <p className="text-slate-600 mt-1">{day.description}</p>}
                  {day.activities && day.activities.length > 0 && (
                    <ul className="mt-2 space-y-1 list-disc list-inside text-slate-500 pl-1">
                      {day.activities.map((act, aIdx) => (
                        <li key={aIdx}>
                          {act.time && <span className="font-semibold text-slate-700">[{act.time}] </span>}
                          <span>{act.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
          <span>Dibuat: {formatDateTime(itinerary.createdAt)}</span>
          <span>Diperbarui: {formatDateTime(itinerary.updatedAt)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button
          size="sm"
          onClick={() => {
            onOpenChange(false);
            onEdit(itinerary);
          }}
          className="text-xs"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
          Edit Template
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
          Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
