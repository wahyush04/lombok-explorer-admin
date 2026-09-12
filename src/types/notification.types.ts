import { Region } from './common.types';

export interface AdminBroadcastNotificationRequest {
  title: string;
  body: string;
  targetPlatform: 'ALL' | 'ANDROID' | 'IOS' | 'WEB';
  targetRegion?: Region | null;
  imageUrl?: string | null;
  deepLink?: string | null;
  notificationType?: string;
}

export interface AdminBroadcastResult {
  title: string;
  body: string;
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  sentAt: string;
}

export interface NotificationDeviceStats {
  devices: {
    totalActive: number;
    android: number;
    ios: number;
    web: number;
  };
  recentBroadcasts: Array<{
    id: string;
    title: string;
    targetPlatform: string;
    sentCount: number;
    failedCount: number;
    sentBy: string;
    sentAt: string;
  }>;
}
