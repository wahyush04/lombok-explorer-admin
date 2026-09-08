import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '../api/restaurant.api';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Utensils, Plus, Trash2, Star } from 'lucide-react';
import { Restaurant } from '@/types/restaurant.types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { CloudinaryAsset } from '@/types/upload.types';

interface RestaurantGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant | null;
}

export function RestaurantGalleryModal({
  open,
  onOpenChange,
  restaurant,
}: RestaurantGalleryModalProps) {
  const queryClient = useQueryClient();
  const [uploadedAsset, setUploadedAsset] = useState<CloudinaryAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: images, isLoading } = useQuery({
    queryKey: ['restaurant-images', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const res = await restaurantApi.getRestaurantImages(restaurant.id);
      return res.data;
    },
    enabled: open && Boolean(restaurant?.id),
  });

  const addImageMutation = useMutation({
    mutationFn: async () => {
      if (!restaurant?.id || !uploadedAsset) return;
      return restaurantApi.createRestaurantImage(restaurant.id, {
        image: uploadedAsset,
        publicId: uploadedAsset.publicId,
        secureUrl: uploadedAsset.secureUrl,
        imageUrl: uploadedAsset.secureUrl,
        width: uploadedAsset.width || undefined,
        height: uploadedAsset.height || undefined,
        format: uploadedAsset.format || undefined,
        caption,
        altText,
        isPrimary: images?.length === 0,
        orderIndex: images?.length || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-images', restaurant?.id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setUploadedAsset(null);
      setCaption('');
      setAltText('');
      setShowAddForm(false);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!restaurant?.id) return;
      return restaurantApi.deleteRestaurantImage(restaurant.id, imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-images', restaurant?.id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!restaurant?.id) return;
      return restaurantApi.updateRestaurantImage(restaurant.id, imageId, { isPrimary: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-images', restaurant?.id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  if (!restaurant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Utensils className="h-5 w-5 text-amber-600" />
          <span>Galeri Foto: {restaurant.name}</span>
        </DialogTitle>
        <DialogDescription>
          Kelola foto menu, suasana tempat makan, foto hidangan andalan, dan keterangannya.
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
            Tambah Foto Baru ke Galeri Restoran
          </Button>
        ) : (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2.5">
            <h4 className="text-xs font-semibold text-amber-950">Formulir Tambah Foto Galeri Restoran</h4>
            <div>
              <ImageUploader
                resourceType="RESTAURANT_IMAGE"
                resourceId={restaurant.id}
                multiple={false}
                label="Unggah Foto Galeri *"
                description="Pilih foto hidangan atau suasana restoran untuk diunggah langsung ke Cloudinary"
                value={uploadedAsset}
                onChange={(asset) => setUploadedAsset(asset)}
                onUploadingChange={setIsUploading}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Caption / Keterangan</label>
                <Input
                  placeholder="cth: Hidangan Ayam Taliwang Panas"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Alt Text (Aksesibilitas)</label>
                <Input
                  placeholder="cth: Suasana ruang makan lesehan"
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
                onClick={() => {
                  setShowAddForm(false);
                  setUploadedAsset(null);
                }}
                className="text-xs h-7"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => addImageMutation.mutate()}
                isLoading={addImageMutation.isPending}
                disabled={!uploadedAsset || isUploading}
                className="text-xs h-7 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isUploading ? 'Mengunggah...' : 'Simpan Foto'}
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
                  alt={img.altText || img.caption || 'Restaurant Photo'}
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
            Belum ada foto galeri tambahan untuk restoran ini.
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Selesai</Button>
      </DialogFooter>
    </Dialog>
  );
}
