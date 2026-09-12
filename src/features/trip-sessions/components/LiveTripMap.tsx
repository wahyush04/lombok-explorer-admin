import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { tripSessionApi } from '../api/trip-session.api';
import { Navigation, Users, RefreshCw, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const LOMBOK_CENTER: [number, number] = [116.248, -8.65];

export function LiveTripMap({ onSelectSession }: { onSelectSession?: (id: string) => void }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['live-trip-points'],
    queryFn: async () => {
      const res = await tripSessionApi.getLiveMapPoints();
      return res.data || [];
    },
    refetchInterval: 15000, // auto poll every 15s
  });

  const points = data || [];

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_PUBLIC_TOKEN || '';
    if (!token) {
      console.warn('Mapbox access token is not set. Please set VITE_MAPBOX_TOKEN in your .env file.');
    }
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: LOMBOK_CENTER,
      zoom: 9.5,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    points.forEach((pt) => {
      if (!pt.latitude || !pt.longitude) return;

      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-pointer group';
      el.innerHTML = `
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
        <div class="relative flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg text-white font-bold text-xs">
          ${pt.userName.charAt(0).toUpperCase()}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div class="p-2 text-slate-800">
          <div class="font-bold text-xs text-slate-900 mb-0.5">${pt.userName}</div>
          <div class="text-[11px] text-emerald-700 font-medium truncate mb-1">${pt.itineraryTitle}</div>
          <div class="text-[10px] text-slate-500">
            Jarak: ${(pt.totalDistanceMeters / 1000).toFixed(1)} km &bull; Durasi: ${Math.round(pt.totalDurationSeconds / 60)} mnt
          </div>
        </div>
      `);

      el.addEventListener('click', () => {
        if (onSelectSession) onSelectSession(pt.id);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([pt.longitude, pt.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [points, onSelectSession]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-950">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-white text-xs shadow-md">
        <Navigation className="h-4 w-4 text-emerald-400 animate-pulse" />
        <span className="font-semibold">Live Tourist Radar</span>
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 text-[10px] ml-1">
          {points.length} Wisatawan Aktif
        </Badge>
      </div>

      <div className="absolute top-3 right-14 z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 text-xs bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800 gap-1.5 shadow-md"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-emerald-400' : ''}`} />
          Perbarui
        </Button>
      </div>

      <div ref={mapContainerRef} className="w-full h-[420px]" />
    </div>
  );
}
