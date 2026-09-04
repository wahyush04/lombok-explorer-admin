import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { destinationApi } from '../api/destination.api';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Plus, Trash2, CheckCircle, Star } from 'lucide-react';
import { Destination } from '@/types/destination.types';

interface DestinationGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: Destination | null;
}

export function DestinationGalleryModal({
  open,
  onOpenChange,
  destination,
}: DestinationGalleryModalProps) {
  const queryClient = useQueryClient();
  const [newImageUrl, setNewImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: images, isLoading } = useQuery({
    queryKey: ['destination-images', destination?.id],
    queryFn: async () => {
      if (!destination?.id) return [];
      const res = await destinationApi.getDestinationImages(destination.id);
      return res.data;
    },
    enabled: open && Boolean(destination?.id),
  });

  const addImageMutation = useMutation({
    mutationFn: async () => {
      if (!destination?.id || !newImageUrl) return;
      return destinationApi.createDestinationImage(destination.id, {
        imageUrl: newImageUrl,
        caption,
        altText,
        isPrimary: images?.length === 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination-images', destination?.id] });
      setNewImageUrl('');
      setCaption('');
      setAltText('');
      setShowAddForm(false);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!destination?.id) return;
      return destinationApi.deleteDestinationImage(destination.id, imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination-images', destination?.id] });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!destination?.id) return;
      return destinationApi.updateDestinationImage(destination.id, imageId, { isPrimary: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination-images', destination?.id] });
    },
  });

  if (!destination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5 text-emerald-600" />
          <span>Galeri Gambar: {destination.name}</span>
        </DialogTitle>
        <DialogDescription>
          Kelola foto resolusi tinggi, gambar sampul, keterangan teks (caption), dan alt-text destinasi.
        </DialogDescription>
      </DialogHeader>

      <div className="py-3 space-y-4 max-h-[65vh] overflow-y-auto">
        {/* Toggle Add Form */}
        {!showAddForm ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah URL Foto Baru ke Galeri
          </Button>
        ) : (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
            <h4 className="text-xs font-semibold text-emerald-950">Formulir Tambah Foto</h4>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">URL Gambar (JPG/PNG/WebP) *</label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Caption / Keterangan</label>
                <Input
                  placeholder="cth: Suasana sore hari"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Alt Text (Aksesibilitas)</label>
                <Input
                  placeholder="cth: Pantai pasir putih Lombok"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="text-xs h-7"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => addImageMutation.mutate()}
                isLoading={addImageMutation.isPending}
                disabled={!newImageUrl}
                className="text-xs h-7"
              >
                Simpan Foto
              </Button>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : images && images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xs"
              >
                <img
                  src={img.imageUrl}
                  alt={img.altText || img.caption || 'Destination Photo'}
                  className="h-36 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-2.5 flex flex-col justify-between opacity-90 transition-opacity">
                  <div className="flex items-center justify-between">
                    {img.isPrimary ? (
                      <Badge variant="success" className="text-[10px] py-0 px-1.5">
                        <Star className="h-3 w-3 mr-1 fill-white" /> Foto Utama
                      </Badge>
                    ) : (
                      <button
                        onClick={() => setPrimaryMutation.mutate(img.id)}
                        className="text-[10px] bg-white/80 hover:bg-white text-slate-800 font-medium px-2 py-0.5 rounded cursor-pointer"
                        title="Jadikan Foto Utama"
                      >
                        Set Utama
                      </button>
                    )}
                    <button
                      onClick={() => deleteImageMutation.mutate(img.id)}
                      className="p-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    {img.caption && (
                      <p className="text-[11px] text-white font-medium truncate drop-shadow-xs">
                        {img.caption}
                      </p>
                    )}
                    {img.altText && (
                      <p className="text-[10px] text-slate-300 truncate">
                        Alt: {img.altText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada foto galeri tambahan untuk destinasi ini.
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Selesai</Button>
      </DialogFooter>
    </Dialog>
  );
}
