import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { formatNumber } from '@/lib/utils/format';
import {
  Users,
  MapPin,
  FolderTree,
  UtensilsCrossed,
  Hotel,
  Star,
  Clock,
  CalendarRange,
  ArrowUpRight,
  Plus,
  Sparkles,
  ChevronRight,
  Compass,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (path: string) => void;
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard();
      return res.data;
    },
  });

  if (isError) {
    return <ErrorState message="Gagal memuat metrik dashboard." onRetry={refetch} />;
  }

  const overview = data?.overview;
  const periodic = data?.periodicMetrics;
  const highlights = data?.highlights;

  const statCards = [
    {
      title: 'Total Destinasi',
      value: overview?.totalDestinations,
      path: '/destinations',
      icon: MapPin,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Pengguna Terdaftar',
      value: overview?.totalUsers,
      path: '/users',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Kategori Wisata',
      value: overview?.totalCategories,
      path: '/categories',
      icon: FolderTree,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Kuliner & Restoran',
      value: overview?.totalRestaurants,
      path: '/restaurants',
      icon: UtensilsCrossed,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      title: 'Akomodasi & Hotel',
      value: overview?.totalAccommodations,
      path: '/accommodations',
      icon: Hotel,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Review Wisatawan',
      value: overview?.totalReviews,
      path: '/reviews',
      icon: Star,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      title: 'Menunggu Moderasi',
      value: overview?.pendingReviews,
      path: '/reviews',
      icon: Clock,
      color: 'text-amber-700 bg-amber-100/70 border border-amber-200',
      highlight: (overview?.pendingReviews ?? 0) > 0,
    },
    {
      title: 'Template Itinerary',
      value: overview?.totalItineraries,
      path: '/itinerary-templates',
      icon: CalendarRange,
      color: 'text-teal-600 bg-teal-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-6 sm:p-8 text-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="h-4 w-4" />
              <span>Portal Pusat Kendali Pariwisata NTB</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Datang di Lombok Explorer Admin
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 leading-relaxed">
              Kelola destinasi wisata kelas dunia, akomodasi, ulasan pengunjung, serta kurasi feed secara terpusat dan aman.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
            <Button
              onClick={() => onNavigate('/destinations?action=new')}
              variant="secondary"
              size="sm"
              className="bg-white text-emerald-900 hover:bg-emerald-50 border-0 font-semibold text-xs shadow-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Destinasi Baru
            </Button>
            <Button
              onClick={() => onNavigate('/reviews?status=PENDING')}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 text-xs"
            >
              Moderasi Review ({overview?.pendingReviews ?? 0})
            </Button>
          </div>
        </div>
        {/* Background visual motif */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-700/20 blur-2xl pointer-events-none" />
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Ringkasan Statistik Eksekutif
        </h2>
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : p === '90d' ? '90 Hari' : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              onClick={() => onNavigate(stat.path)}
              className={`cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm ${
                stat.highlight ? 'ring-1 ring-amber-400 bg-amber-50/20' : ''
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 block truncate">
                    {stat.title}
                  </span>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 block">
                      {formatNumber(stat.value ?? 0)}
                    </span>
                  )}
                  <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center group-hover:underline">
                    Kelola data <ArrowUpRight className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${stat.color} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Periodic Highlights & Highlights Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Destinations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Destinasi Terpopuler
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Berdasarkan jumlah review dan rating wisatawan
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/destinations?sortBy=reviewCount&order=desc')}
              className="text-xs text-emerald-600 hover:text-emerald-700"
            >
              Lihat Semua <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : highlights?.popularDestinations?.length ? (
              highlights.popularDestinations.map((dst) => (
                <div
                  key={dst.id}
                  onClick={() => onNavigate(`/destinations?id=${dst.id}`)}
                  className="flex items-center justify-between py-3 hover:bg-slate-50/75 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={dst.coverImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62'}
                      alt={dst.name}
                      className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {dst.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {dst.categoryName || 'Wisata'} • {dst.region.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="flex items-center text-xs font-bold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                      {dst.rating.toFixed(1)}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {dst.reviewCount} review
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada data destinasi terpopuler.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Favorited Destinations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Destinasi Favorit Wisatawan
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Destinasi yang paling sering disimpan ke wishlist
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/destinations?sortBy=favoritesCount&order=desc')}
              className="text-xs text-emerald-600 hover:text-emerald-700"
            >
              Lihat Semua <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : highlights?.mostFavoritedDestinations?.length ? (
              highlights.mostFavoritedDestinations.map((dst) => (
                <div
                  key={dst.id}
                  onClick={() => onNavigate(`/destinations?id=${dst.id}`)}
                  className="flex items-center justify-between py-3 hover:bg-slate-50/75 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={dst.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}
                      alt={dst.name}
                      className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {dst.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {dst.categoryName || 'Wisata'} • {dst.region.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-xs font-bold text-emerald-600">
                      {dst.favoritesCount} disimpan
                    </div>
                    <span className="text-[11px] text-slate-400">
                      ★ {dst.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada data destinasi favorit.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Operations Bar */}
      <Card className="bg-slate-50/60 border border-slate-200">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Aksi Cepat Manajemen</h4>
              <p className="text-[11px] text-slate-500">Akses langsung ke formulir entri data dan moderasi</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/categories')}
              className="text-xs h-8"
            >
              + Kategori
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/restaurants')}
              className="text-xs h-8"
            >
              + Restoran
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/accommodations')}
              className="text-xs h-8"
            >
              + Akomodasi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/feeds')}
              className="text-xs h-8"
            >
              Laporan Feed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/audit-logs')}
              className="text-xs h-8"
            >
              Audit Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
