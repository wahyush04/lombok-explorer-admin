import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Compass, Crosshair, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

// Central Lombok Coordinates
const LOMBOK_CENTER: [number, number] = [116.248, -8.65]; // [lng, lat]
const DEFAULT_ZOOM = 10;

// Popular Lombok Region Presets for quick pinpointing
const LOMBOK_PRESETS = [
  { name: 'Mataram', lat: -8.5833, lng: 116.1167 },
  { name: 'Senggigi', lat: -8.4912, lng: 116.0398 },
  { name: 'Kuta / Mandalika', lat: -8.8956, lng: 116.2811 },
  { name: 'Sembalun / Rinjani', lat: -8.3589, lng: 116.5256 },
  { name: 'Gili Trawangan', lat: -8.3508, lng: 116.0392 },
  { name: 'Sekotong', lat: -8.7428, lng: 115.9372 },
];

export interface LocationMapPickerProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onLocationChange: (lat: number, lng: number) => void;
  errors?: {
    latitude?: string;
    longitude?: string;
  };
  label?: string;
  helperText?: string;
  className?: string;
}

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  errors,
  label = 'Titik Koordinat Lokasi (Mapbox)',
  helperText = 'Klik pada peta atau geser pin merah untuk menentukan titik koordinat GPS secara presisi.',
  className,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [copied, setCopied] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Local string representation for smooth text editing
  const [latInput, setLatInput] = useState<string>(
    latitude !== undefined && latitude !== null && !isNaN(Number(latitude)) ? String(latitude) : ''
  );
  const [lngInput, setLngInput] = useState<string>(
    longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? String(longitude) : ''
  );

  // Sync internal input state if props change from outside
  useEffect(() => {
    if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) {
      setLatInput((prev) => (parseFloat(prev) === Number(latitude) ? prev : String(latitude)));
    } else {
      setLatInput('');
    }
  }, [latitude]);

  useEffect(() => {
    if (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) {
      setLngInput((prev) => (parseFloat(prev) === Number(longitude) ? prev : String(longitude)));
    } else {
      setLngInput('');
    }
  }, [longitude]);

  // Determine initial coordinates
  const validLat = latitude !== undefined && latitude !== null && !isNaN(Number(latitude)) ? Number(latitude) : null;
  const validLng = longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? Number(longitude) : null;
  const hasCoordinates = validLat !== null && validLng !== null;

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_PUBLIC_TOKEN || '';
    if (!token) {
      console.warn('Mapbox access token is not set. Please set VITE_MAPBOX_TOKEN in your .env file.');
    }
    mapboxgl.accessToken = token;

    const initialLng = validLng ?? LOMBOK_CENTER[0];
    const initialLat = validLat ?? LOMBOK_CENTER[1];
    const initialZoom = hasCoordinates ? 13 : DEFAULT_ZOOM;

    // Disable Mapbox telemetry to prevent adblocker ERR_BLOCKED_BY_CLIENT errors
    if ((mapboxgl as any).config) {
      try {
        Object.defineProperty((mapboxgl as any).config, 'EVENTS_URL', {
          value: null,
          configurable: true,
          writable: true,
        });
      } catch {
        // Ignore if not configurable
      }
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: initialZoom,
      attributionControl: true,
      transformRequest: (url) => {
        // Intercept and suppress any telemetry events requests
        if (url && url.includes('events.mapbox.com')) {
          return { url: '' };
        }
        return { url };
      },
    });

    // Add navigation controls (zoom, compass)
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');

    // Create native draggable marker (avoids CSS transform conflicts and hover jitter)
    const marker = new mapboxgl.Marker({
      color: '#e11d48',
      draggable: true,
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    // Marker live drag event to sync coordinates in real time
    marker.on('drag', () => {
      const lngLat = marker.getLngLat();
      setLatInput(String(Number(lngLat.lat.toFixed(6))));
      setLngInput(String(Number(lngLat.lng.toFixed(6))));
    });

    // Marker dragend event
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const newLat = Number(lngLat.lat.toFixed(6));
      const newLng = Number(lngLat.lng.toFixed(6));
      setLatInput(String(newLat));
      setLngInput(String(newLng));
      onLocationChange(newLat, newLng);
    });

    // Click anywhere on map to reposition marker
    map.on('click', (e) => {
      const newLat = Number(e.lngLat.lat.toFixed(6));
      const newLng = Number(e.lngLat.lng.toFixed(6));
      marker.setLngLat([newLng, newLat]);
      setLatInput(String(newLat));
      setLngInput(String(newLng));
      onLocationChange(newLat, newLng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Trigger map resize after container layout stabilizes
    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 250);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // Run once on mount

  // Update marker & map view when external lat/lng changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (validLat !== null && validLng !== null) {
      markerRef.current.setLngLat([validLng, validLat]);
    }
  }, [validLat, validLng]);

  // Handle manual input changes
  const handleLatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLatInput(val);
    const parsedLat = parseFloat(val);
    const currentLng = validLng ?? LOMBOK_CENTER[0];
    if (!isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
      onLocationChange(parsedLat, currentLng);
      if (mapRef.current && markerRef.current) {
        markerRef.current.setLngLat([currentLng, parsedLat]);
        mapRef.current.flyTo({ center: [currentLng, parsedLat], speed: 1.2 });
      }
    }
  };

  const handleLngInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLngInput(val);
    const parsedLng = parseFloat(val);
    const currentLat = validLat ?? LOMBOK_CENTER[1];
    if (!isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180) {
      onLocationChange(currentLat, parsedLng);
      if (mapRef.current && markerRef.current) {
        markerRef.current.setLngLat([parsedLng, currentLat]);
        mapRef.current.flyTo({ center: [parsedLng, currentLat], speed: 1.2 });
      }
    }
  };

  // Jump to quick preset
  const applyPreset = useCallback(
    (presetLat: number, presetLng: number) => {
      onLocationChange(presetLat, presetLng);
      if (mapRef.current && markerRef.current) {
        markerRef.current.setLngLat([presetLng, presetLat]);
        mapRef.current.flyTo({ center: [presetLng, presetLat], zoom: 13, speed: 1.4 });
      }
    },
    [onLocationChange]
  );

  // Use browser geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        applyPreset(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        alert('Gagal mengambil lokasi saat ini: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Reset to Lombok Island Center
  const handleResetToLombok = () => {
    applyPreset(LOMBOK_CENTER[1], LOMBOK_CENTER[0]);
    if (mapRef.current) {
      mapRef.current.flyTo({ center: LOMBOK_CENTER, zoom: DEFAULT_ZOOM, speed: 1.2 });
    }
  };

  // Copy coordinates string
  const handleCopyCoordinates = () => {
    if (validLat !== null && validLng !== null) {
      navigator.clipboard.writeText(`${validLat}, ${validLng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('space-y-2.5', className)}>
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-800">{label}</span>
          <span className="text-rose-500 font-bold">*</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shadow-2xs transition-colors hover:text-emerald-700 disabled:opacity-50"
            title="Gunakan titik koordinat GPS perangkat saat ini"
          >
            <Crosshair className={cn('w-3 h-3 text-slate-500', isLocating && 'animate-spin text-emerald-600')} />
            <span>{isLocating ? 'Mendeteksi...' : 'Lokasi Saya'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetToLombok}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shadow-2xs transition-colors hover:text-emerald-700"
            title="Kembali ke tampilan peta pulau Lombok"
          >
            <Compass className="w-3 h-3 text-slate-500" />
            <span>Tengah Lombok</span>
          </button>
        </div>
      </div>

      {/* Quick Region Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
        <span className="text-slate-500 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider">
          Preset Cepat:
        </span>
        {LOMBOK_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => applyPreset(preset.lat, preset.lng)}
            className="px-2 py-0.5 whitespace-nowrap rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200/70 transition-colors text-[11px] font-medium"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Mapbox Canvas Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-64 sm:h-72" />

        {/* Current coordinates overlay badge */}
        <div className="absolute bottom-2 left-2 z-10 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[11px] flex items-center gap-2 font-mono shadow-md border border-white/10">
          <span className="flex items-center gap-1 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Lat: <strong className="text-white">{validLat !== null ? validLat : '-'}</strong>, Lng:{' '}
            <strong className="text-white">{validLng !== null ? validLng : '-'}</strong>
          </span>
          {hasCoordinates && (
            <button
              type="button"
              onClick={handleCopyCoordinates}
              className="text-slate-300 hover:text-white transition-colors p-0.5"
              title="Salin koordinat"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {helperText && <p className="text-[11px] text-slate-500 italic">{helperText}</p>}

      {/* Synchronized Manual Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Latitude <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              step="any"
              placeholder="-8.5833"
              value={latInput}
              onChange={handleLatInputChange}
              error={errors?.latitude}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Longitude <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              step="any"
              placeholder="116.1167"
              value={lngInput}
              onChange={handleLngInputChange}
              error={errors?.longitude}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
