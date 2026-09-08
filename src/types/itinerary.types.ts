import { PaginationMeta } from './auth.types';
import { CloudinaryAsset } from './upload.types';
import { ItineraryTemplateTranslationDto } from './localization.types';

export type ItineraryTravelStyle =
  | 'NATURE_ADVENTURE'
  | 'BEACH_RELAXATION'
  | 'CULTURAL_HISTORICAL'
  | 'CULINARY_EXPLORATION'
  | 'RELAXED_LEISURE'
  | 'BACKPACKER_BUDGET';

export type BudgetLevel = 'BUDGET' | 'MID_RANGE' | 'LUXURY';
export type TransportationMode = 'MOTORCYCLE' | 'CAR' | 'PUBLIC_TRANSPORT' | 'WALKING';

export type ItineraryTemplate = AdminItineraryTemplateDto;
export type ItineraryStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
export type CreateItineraryTemplateDto = CreateItineraryTemplateRequest;
export type UpdateItineraryTemplateDto = UpdateItineraryTemplateRequest;
export type ItineraryDay = AdminTemplateDayInput;

export interface ItineraryFilters {
  page?: number;
  limit?: number;
  search?: string;
  travelStyle?: ItineraryTravelStyle;
  budgetLevel?: BudgetLevel;
  transportationMode?: TransportationMode;
  isPublished?: boolean;
  status?: ItineraryStatus;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface AdminTemplateActivityInput {
  id?: string;
  destinationId?: string | null;
  destinationName?: string | null;
  customLocation?: string | {
    name: string;
    latitude: number;
    longitude: number;
    address?: string | null;
  } | null;
  customTitle?: string | null;
  title?: string | null;
  time?: string | null;
  description?: string | null;
  orderIndex?: number;
  startTime?: string | null;
  endTime?: string | null;
  activityNotes?: string | null;
  estimatedDurationMinutes?: number;
  estimatedCost?: number;
  distanceFromPrevKm?: number;
  travelTimeFromPrevMinutes?: number;
}

export interface AdminTemplateDayInput {
  id?: string;
  dayNumber: number;
  title: string;
  description?: string | null;
  notes?: string | null;
  totalDistanceKm?: number;
  totalDurationMinutes?: number;
  estimatedBudget?: number;
  activities?: AdminTemplateActivityInput[];
}

export interface AdminItineraryTemplateDto {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  totalDays: number;
  durationDays?: number;
  estimatedCost?: number;
  currency?: string;
  tags?: string[];
  status?: ItineraryStatus;
  travelStyle: ItineraryTravelStyle;
  budgetLevel: BudgetLevel;
  transportationMode: TransportationMode;
  transportPaceNote?: string | null;
  totalEstimatedBudget?: number;
  totalDistanceKm?: number;
  totalDurationMinutes?: number;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  days?: AdminTemplateDayInput[];
  translations?: ItineraryTemplateTranslationDto[];
  availableLocales?: string[];
  missingLocales?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminTemplateListResponse {
  success: boolean;
  message: string;
  data: AdminItineraryTemplateDto[];
  meta: PaginationMeta;
}

export interface AdminTemplateDetailResponse {
  success: boolean;
  message: string;
  data: AdminItineraryTemplateDto;
}

export interface CreateItineraryTemplateRequest {
  title: string;
  description?: string | null;
  coverImage?: CloudinaryAsset | string | null;
  coverImageUrl?: string | null;
  totalDays?: number;
  travelStyle?: ItineraryTravelStyle;
  budgetLevel?: BudgetLevel;
  transportationMode?: TransportationMode;
  transportPaceNote?: string | null;
  totalEstimatedBudget?: number;
  totalDistanceKm?: number;
  totalDurationMinutes?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  days?: AdminTemplateDayInput[];
  translations?: ItineraryTemplateTranslationDto[];
}

export interface UpdateItineraryTemplateRequest {
  title?: string;
  description?: string | null;
  coverImage?: CloudinaryAsset | string | null;
  coverImageUrl?: string | null;
  totalDays?: number;
  travelStyle?: ItineraryTravelStyle;
  budgetLevel?: BudgetLevel;
  transportationMode?: TransportationMode;
  transportPaceNote?: string | null;
  totalEstimatedBudget?: number;
  totalDistanceKm?: number;
  totalDurationMinutes?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  days?: AdminTemplateDayInput[];
  translations?: ItineraryTemplateTranslationDto[];
}
