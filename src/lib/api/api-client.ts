import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/lib/auth/token-storage';
import { normalizeApiError } from './api-error';

const DEFAULT_API_BASE_URL = 'http://34.142.205.101:3000/api/v1/admin';

// Determine canonical API Base URL
function getBaseUrl(): string {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;
  const envUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    metaEnv?.VITE_API_BASE_URL ||
    metaEnv?.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  if (!envUrl) {
    return DEFAULT_API_BASE_URL;
  }

  // Ensure trailing slash removed
  const trimmed = envUrl.replace(/\/+$/, '');
  // Prevent double /api/v1/admin
  if (trimmed.endsWith('/api/v1/admin') || trimmed.endsWith('/v1/admin')) {
    return trimmed;
  }
  return `${trimmed}/api/v1/admin`;
}

export const API_BASE_URL = getBaseUrl();

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject JWT Bearer Token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

// Response interceptor: handle 401 & token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried and not login/refresh endpoint
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(normalizeApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = tokenStorage.getRefreshToken();
      if (!currentRefreshToken) {
        tokenStorage.clear();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=1';
        }
        return Promise.reject(normalizeApiError(error));
      }

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: currentRefreshToken,
        });

        const authData = refreshResponse.data?.data;
        if (authData?.accessToken) {
          tokenStorage.setTokens(authData.accessToken, authData.refreshToken, authData.user);
          processQueue(null, authData.accessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        tokenStorage.clear();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=1';
        }
        return Promise.reject(normalizeApiError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export const apiClient = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await axiosInstance.get<T>(url, { params });
    return response.data;
  },

  async post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  async put<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  async patch<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },

  async delete<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await axiosInstance.delete<T>(url, { params });
    return response.data;
  },
};
