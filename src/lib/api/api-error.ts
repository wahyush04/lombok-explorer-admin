import { ErrorDetail } from '@/types/api.types';

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  details?: ErrorDetail[] | string[] | null;

  constructor(statusCode: number, message: string, errorCode = 'UNKNOWN_ERROR', details?: ErrorDetail[] | string[] | null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // Axios or Fetch error structure
  if (typeof error === 'object' && error !== null) {
    const errObj = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          errorCode?: string;
          details?: ErrorDetail[] | string[];
        };
      };
      message?: string;
      code?: string;
    };

    if (errObj.response) {
      const status = errObj.response.status || 500;
      const data = errObj.response.data;
      const message = data?.message || getDefaultStatusMessage(status);
      const errorCode = data?.errorCode || `HTTP_${status}`;
      return new ApiError(status, message, errorCode, data?.details);
    }

    if (errObj.code === 'ECONNABORTED' || errObj.message?.includes('timeout')) {
      return new ApiError(408, 'Koneksi waktu habis (request timeout). Silakan coba lagi.', 'REQUEST_TIMEOUT');
    }

    if (errObj.message) {
      return new ApiError(500, errObj.message, 'INTERNAL_ERROR');
    }
  }

  return new ApiError(500, 'Terjadi kesalahan sistem yang tidak terduga.', 'UNEXPECTED_ERROR');
}

export function getDefaultStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Data yang dikirimkan tidak valid atau kurang lengkap.';
    case 401:
      return 'Sesi login telah berakhir atau kredensial tidak valid.';
    case 403:
      return 'Akses ditolak. Memerlukan hak akses Administrator (role: ADMIN).';
    case 404:
      return 'Data yang dicari tidak ditemukan.';
    case 409:
      return 'Terjadi konflik data (misalnya duplikasi atau relasi yang masih aktif).';
    case 429:
      return 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.';
    case 500:
      return 'Terjadi gangguan internal pada server.';
    default:
      return 'Terjadi kesalahan pada jaringan atau server.';
  }
}
