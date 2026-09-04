export interface DashboardOverviewDto {
  totalUsers: number;
  totalDestinations: number;
  totalCategories: number;
  totalRestaurants: number;
  totalAccommodations: number;
  totalReviews: number;
  pendingReviews: number;
  totalItineraries: number;
}

export interface DashboardPeriodicMetricsDto {
  newUsers: number;
  newReviews: number;
  newItineraries: number;
  dateRange: {
    startDate?: string | null;
    endDate?: string | null;
  };
}

export interface DashboardPopularDestinationDto {
  id: string;
  name: string;
  slug: string;
  region: string;
  categoryName?: string;
  rating: number;
  reviewCount: number;
  coverImageUrl?: string;
}

export interface DashboardFavoritedDestinationDto {
  id: string;
  name: string;
  slug: string;
  region: string;
  categoryName?: string;
  rating: number;
  favoritesCount: number;
  coverImageUrl?: string;
}

export interface DashboardStatisticsDto {
  overview: DashboardOverviewDto;
  periodicMetrics: DashboardPeriodicMetricsDto;
  highlights: {
    popularDestinations: DashboardPopularDestinationDto[];
    mostFavoritedDestinations: DashboardFavoritedDestinationDto[];
  };
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardStatisticsDto;
}
