import { TravelStyle } from './auth.types';

export type BudgetLevel = 'BUDGET' | 'MID_RANGE' | 'LUXURY';

export interface AdminRecommendationItem {
  id: string;
  title: string;
  subtitle: string;
  bannerUrl: string;
  bannerPublicId?: string | null;
  travelStyle: TravelStyle;
  budgetLevel: BudgetLevel;
  recommendedDays: number;
  estimatedBudget: number;
  isActive: boolean;
  createdAt: string;
  destinations: Array<{
    id: string;
    orderIndex: number;
    destination: {
      id: string;
      name: string;
      region: string;
      coverImageUrl: string;
      rating: number;
    };
  }>;
}

export interface CreateAdminRecommendationInput {
  title: string;
  subtitle: string;
  bannerUrl: string;
  travelStyle: TravelStyle;
  budgetLevel: BudgetLevel;
  recommendedDays: number;
  estimatedBudget: number;
  isActive: boolean;
  destinationIds: string[];
}
