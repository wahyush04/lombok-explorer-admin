import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationApi } from '../api/recommendation.api';
import { destinationApi } from '@/features/destinations/api/destination.api';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Sparkles, Plus, Trash2, MapPin } from 'lucide-react';
import { formatNumber } from '@/lib/utils/format';

export function RecommendationTable() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [travelStyle, setTravelStyle] = useState('BEACH_RELAXATION');
  const [budgetLevel, setBudgetLevel] = useState('MID_RANGE');
  const [recommendedDays, setRecommendedDays] = useState(3);
  const [estimatedBudget, setEstimatedBudget] = useState(1000000);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const res = await recommendationApi.getRecommendations();
      return res.data || [];
    },
  });

  const { data: destinations } = useQuery({
    queryKey: ['all-destinations-for-rec'],
    queryFn: async () => {
      const res = await destinationApi.getDestinations({ limit: 100 });
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return recommendationApi.createRecommendation({
        title,
        subtitle,
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
        travelStyle: travelStyle as any,
        budgetLevel: budgetLevel as any,
        recommendedDays,
        estimatedBudget,
        isActive: true,
        destinationIds: selectedDestinations,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      setCreateOpen(false);
      setTitle('');
      setSubtitle('');
      setBannerUrl('');
      setSelectedDestinations([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return recommendationApi.deleteRecommendation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const items = data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Kelola banner kurasi rekomendasi cerdas yang tampil pada aplikasi mobile
        </span>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Buat Rekomendasi
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableRow>
                <TableHead>Banner & Judul</TableHead>
                <TableHead>Target Wisata</TableHead>
                <TableHead>Durasi & Estimasi</TableHead>
                <TableHead>Destinasi Terpilih</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={item.bannerUrl} alt={item.title} className="h-12 w-20 object-cover rounded-lg" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {item.travelStyle}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-slate-700">
                    {item.recommendedDays} Hari &bull; Rp {formatNumber(item.estimatedBudget)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.destinations?.length || 0} spot terpilih
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700"
                  >
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" /> Buat Koleksi Rekomendasi
          </DialogTitle>
          <DialogDescription>
            Tentukan banner rekomendasi wisata dan pilihan destinasi terkait.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Koleksi *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="cth: Surga Pantai Tersembunyi Lombok" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subjudul *</label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="cth: Kumpulan pantai pasir putih paling tenang..." />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">URL Gambar Banner *</label>
            <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gaya Wisata</label>
              <Select value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
                <option value="BEACH_RELAXATION">Beach Relaxation</option>
                <option value="NATURE_ADVENTURE">Nature Adventure</option>
                <option value="CULTURE_HERITAGE">Culture Heritage</option>
                <option value="CULINARY_EXPLORER">Culinary Explorer</option>
              </Select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Budget</label>
              <Select value={budgetLevel} onChange={(e) => setBudgetLevel(e.target.value)}>
                <option value="BUDGET">Budget Friendly</option>
                <option value="MID_RANGE">Mid Range</option>
                <option value="LUXURY">Luxury</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Destinasi yang Direkomendasikan</label>
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
              {(destinations || []).map((d: any) => {
                const isChecked = selectedDestinations.includes(d.id);
                return (
                  <label key={d.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDestinations((prev) => [...prev, d.id]);
                        } else {
                          setSelectedDestinations((prev) => prev.filter((id) => id !== d.id));
                        }
                      }}
                    />
                    <span className="text-slate-800">{d.name} ({d.region})</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
          <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>Simpan Rekomendasi</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
