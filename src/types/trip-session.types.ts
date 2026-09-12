export type TripSessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type TripActivityStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export interface AdminTripSessionListItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl: string | null;
  itineraryId: string;
  itineraryTitle: string;
  status: TripSessionStatus;
  startedAt: string;
  endedAt: string | null;
  pausedAt: string | null;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastLocationAt: string | null;
  totalActivitiesCount: number;
  completedActivitiesCount: number;
  createdAt: string;
}

export interface AdminLiveMapPoint {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  itineraryId: string;
  itineraryTitle: string;
  status: TripSessionStatus;
  latitude: number;
  longitude: number;
  lastLocationAt: string;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
}

export interface TripSessionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TripSessionStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface AdminTripSessionDetail {
  id: string;
  userId: string;
  itineraryId: string;
  status: TripSessionStatus;
  startedAt: string;
  endedAt: string | null;
  pausedAt: string | null;
  currentActivityId: string | null;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastLocationAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    phone: string | null;
  };
  itinerary: {
    id: string;
    title: string;
    description: string | null;
    totalDays: number;
    days: Array<{
      id: string;
      dayNumber: number;
      title: string;
      items: Array<{
        id: string;
        orderIndex: number;
        customTitle: string | null;
        destination?: { id: string; name: string; latitude: number; longitude: number } | null;
        restaurant?: { id: string; name: string; latitude: number; longitude: number } | null;
        accommodation?: { id: string; name: string; latitude: number; longitude: number } | null;
      }>;
    }>;
  };
  routes: Array<{
    id: string;
    legOrder: number;
    distanceMeters: number;
    durationSeconds: number;
    geometry: string;
  }>;
  activityProgress: Array<{
    id: string;
    itineraryActivityId: string;
    status: TripActivityStatus;
    arrivedAt: string | null;
    completedAt: string | null;
    skippedAt: string | null;
  }>;
}
