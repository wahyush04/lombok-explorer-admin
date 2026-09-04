import { Region } from '@/types/auth.types';

export const REGION_OPTIONS: { value: Region; label: string; description: string }[] = [
  {
    value: 'LOMBOK_SELATAN',
    label: 'Lombok Selatan',
    description: 'Kuta, Mandalika, Pantai Tanjung Aan, Selong Belanak',
  },
  {
    value: 'LOMBOK_UTARA',
    label: 'Lombok Utara',
    description: 'Gunung Rinjani, Senaru, Air Terjun Sindang Gila',
  },
  {
    value: 'LOMBOK_BARAT',
    label: 'Lombok Barat',
    description: 'Senggigi, Mangsit, Sekotong, Lembar',
  },
  {
    value: 'LOMBOK_TIMUR',
    label: 'Lombok Timur',
    description: 'Sembalun, Tetebatu, Tanjung Ringgit, Jerowaru',
  },
  {
    value: 'LOMBOK_TENGAH',
    label: 'Lombok Tengah',
    description: 'Desa Adat Sade, Sukarara, Praya, Bandara BIZAM',
  },
  {
    value: 'GILI_ISLANDS',
    label: 'Kepulauan Gili',
    description: 'Gili Trawangan, Gili Meno, Gili Air',
  },
];

export const getRegionLabel = (region?: Region | string | null): string => {
  if (!region) return '-';
  const found = REGION_OPTIONS.find((r) => r.value === region);
  return found ? found.label : region;
};
