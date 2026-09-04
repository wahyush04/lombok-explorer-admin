import { Region } from './auth.types';
import { REGION_OPTIONS, getRegionLabel } from '@/lib/constants/regions';

export type { Region } from './auth.types';
export { REGION_OPTIONS, getRegionLabel };

export interface SelectOption<T = string> {
  value: T;
  label: string;
  description?: string;
}

export const REGIONS = REGION_OPTIONS;
