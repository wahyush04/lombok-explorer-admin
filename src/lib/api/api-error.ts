import { ErrorDetail } from '@/types/api.types';

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  code: string;
  details?: ErrorDetail[] | string[] | null;

  constructor(statusCode: number, message: string, errorCode = 'UNKNOWN_ERROR', details?: ErrorDetail[] | string[] | null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.code = errorCode;
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
          code?: string;
          details?: ErrorDetail[] | string[];
          errors?: Array<{ field?: string; code?: string; message?: string }>;
        };
      };
      message?: string;
      code?: string;
    };

    if (errObj.response) {
      const status = errObj.response.status || 500;
      const data = errObj.response.data;
      const message = data?.message || getDefaultStatusMessage(status);
      const errorCode = data?.errorCode || data?.code || `HTTP_${status}`;
      // Support details array or errors array
      const details = data?.details || data?.errors;
      return new ApiError(status, message, errorCode, details as any);
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

/**
 * Check whether an error matches a specific stable error code.
 * Always check error codes for business logic instead of comparing localized message text.
 */
export function isErrorCode(error: unknown, targetCode: string): boolean {
  if (error instanceof ApiError) {
    return error.errorCode === targetCode || error.code === targetCode;
  }
  if (typeof error === 'object' && error !== null) {
    const err = error as { errorCode?: string; code?: string };
    return err.errorCode === targetCode || err.code === targetCode;
  }
  return false;
}

/**
 * Maps backend OpenAPI error field paths to React Hook Form field paths.
 * Supports nested translation fields (e.g., translations.en-US.name -> en_name)
 */
export function mapBackendErrorToFormField(field: string): string {
  if (!field) return field;

  // Check for English translation paths
  if (
    field.includes('translations.en-US.') ||
    field.includes('translations.en.') ||
    field.includes('translations.1.') ||
    field.includes('translations[1].')
  ) {
    const subfield = field.split('.').pop();
    if (subfield) {
      return `en_${subfield}`;
    }
  }

  // Check for Indonesian / canonical translation paths
  if (
    field.includes('translations.id-ID.') ||
    field.includes('translations.id.') ||
    field.includes('translations.0.') ||
    field.includes('translations[0].')
  ) {
    const subfield = field.split('.').pop();
    if (subfield) {
      return subfield;
    }
  }

  return field;
}

/**
 * Sets backend validation error details onto React Hook Form fields.
 * Returns true if field errors were set, false otherwise.
 */
export function setBackendValidationErrors(
  error: unknown,
  setError: (field: any, error: { type: string; message: string }) => void
): boolean {
  const normalized = normalizeApiError(error);
  if (!normalized.details || !Array.isArray(normalized.details) || normalized.details.length === 0) {
    return false;
  }

  let hasSetField = false;
  for (const item of normalized.details) {
    if (typeof item === 'object' && item !== null && 'field' in item && item.field) {
      const formField = mapBackendErrorToFormField(item.field);
      setError(formField, {
        type: 'server',
        message: item.message || 'Data tidak valid',
      });
      hasSetField = true;
    }
  }

  return hasSetField;
}

