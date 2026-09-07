import axios from 'axios';
import { adminUploadApi } from '@/lib/api/upload-api';
import {
  UploadResourceType,
  AdminUploadSignatureData,
  CloudinaryAsset,
  CloudinaryDirectUploadResponse,
  UploadStatus,
} from '@/types/upload.types';

export const DEFAULT_ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
export const DEFAULT_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_CONCURRENCY = 2;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadOptions {
  resourceId?: string | null;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface MultiUploadOptions {
  resourceId?: string | null;
  concurrency?: number;
  onItemProgress?: (index: number, progress: number) => void;
  onItemStatusChange?: (
    index: number,
    status: UploadStatus,
    asset?: CloudinaryAsset,
    error?: string
  ) => void;
  signal?: AbortSignal;
}

export interface MultiUploadResultItem {
  index: number;
  success: boolean;
  asset?: CloudinaryAsset;
  error?: string;
}

/**
 * Validates file MIME type, extension, and file size on the client before upload.
 */
export function validateImageFile(
  file: File,
  allowedFormats: string[] = DEFAULT_ALLOWED_FORMATS,
  maxSizeBytes: number = DEFAULT_MAX_FILE_SIZE
): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan.' };
  }

  // Validate extension
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isExtAllowed = allowedFormats.map((f) => f.toLowerCase()).includes(ext);

  // Validate MIME type
  const isMimeAllowed =
    DEFAULT_ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
    file.type.startsWith('image/');

  if (!isExtAllowed || !isMimeAllowed) {
    return {
      valid: false,
      error: `Format image tidak didukung. Harap gunakan format: ${allowedFormats.join(', ').toUpperCase()}.`,
    };
  }

  // Validate file size
  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Ukuran image terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maksimal ${maxMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Lightweight client-side image downscaling/optimization before upload.
 * Preserves aspect ratio, resizes oversized images, and maintains high quality.
 */
export async function preprocessImage(
  file: File,
  maxWidth = 2560,
  maxHeight = 2560,
  quality = 0.92
): Promise<File | Blob> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  // Only preprocess standard raster images
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width <= maxWidth && height <= maxHeight && file.size <= 2 * 1024 * 1024) {
        // Already optimized enough
        resolve(file);
        return;
      }

      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const processedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(processedFile);
          } else {
            // Keep original if converted is somehow larger
            resolve(file);
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Maps raw Cloudinary direct upload response to frontend CloudinaryAsset model.
 */
export function mapCloudinaryResponseToAsset(
  data: CloudinaryDirectUploadResponse,
  fallbackFilename?: string
): CloudinaryAsset {
  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    width: data.width || null,
    height: data.height || null,
    format: data.format || null,
    bytes: data.bytes || null,
    originalFilename: data.original_filename || fallbackFilename || null,
    resourceType: (data.resource_type as string) || 'image',
  };
}

/**
 * Cloudinary Upload Service
 * Manages signed direct client-to-CDN uploads without proxying binary files to the backend.
 */
export const cloudinaryUploadService = {
  /**
   * Request upload signature from backend.
   */
  async requestUploadSignature(
    resourceType: UploadResourceType,
    resourceId?: string | null
  ): Promise<AdminUploadSignatureData> {
    return adminUploadApi.getSignature(resourceType, resourceId);
  },

  /**
   * Uploads a file/blob directly to Cloudinary using signed parameters.
   * NOTE: Uses a separate axios call without Authorization headers so JWT is never sent to Cloudinary.
   */
  async uploadToCloudinary(
    file: File | Blob,
    signatureData: AdminUploadSignatureData,
    options?: {
      onProgress?: (progress: number) => void;
      signal?: AbortSignal;
      originalFilename?: string;
    }
  ): Promise<CloudinaryAsset> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', String(signatureData.timestamp));
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);

    try {
      const response = await axios.post<CloudinaryDirectUploadResponse>(
        signatureData.uploadUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: options?.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && progressEvent.total > 0) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              options?.onProgress?.(percent);
            }
          },
          timeout: 120000, // 2 minutes timeout for large images
        }
      );

      const filename =
        options?.originalFilename ||
        (file instanceof File ? file.name : undefined);

      return mapCloudinaryResponseToAsset(response.data, filename);
    } catch (err: unknown) {
      if (axios.isCancel(err) || (err instanceof Error && err.name === 'CanceledError')) {
        throw new Error('Upload dibatalkan.');
      }

      if (axios.isAxiosError(err)) {
        const cloudinaryMsg = err.response?.data?.error?.message;
        if (cloudinaryMsg) {
          throw new Error(`Cloudinary error: ${cloudinaryMsg}`);
        }
        if (err.code === 'ECONNABORTED') {
          throw new Error('Upload timeout. Koneksi lambat, silakan coba lagi.');
        }
      }

      throw new Error(
        err instanceof Error ? err.message : 'Upload gagal. Silakan coba lagi.'
      );
    }
  },

  /**
   * Complete single image upload pipeline:
   * Validation -> Preprocessing -> Request Signature -> Direct Upload -> Asset Mapping
   */
  async uploadSingleImage(
    file: File,
    resourceType: UploadResourceType,
    options?: UploadOptions
  ): Promise<CloudinaryAsset> {
    // 1. Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Validasi file gagal.');
    }

    // 2. Preprocess file if supported
    const processed = await preprocessImage(file);

    // 3. Request signature from backend
    const signature = await this.requestUploadSignature(
      resourceType,
      options?.resourceId
    );

    // Re-verify against backend signature constraints if provided
    if (signature.allowedFormats && signature.allowedFormats.length > 0) {
      const postValidation = validateImageFile(
        file,
        signature.allowedFormats,
        signature.maxFileSize || DEFAULT_MAX_FILE_SIZE
      );
      if (!postValidation.valid) {
        throw new Error(postValidation.error);
      }
    }

    // 4. Direct upload to Cloudinary
    return this.uploadToCloudinary(processed, signature, {
      onProgress: options?.onProgress,
      signal: options?.signal,
      originalFilename: file.name,
    });
  },

  /**
   * Upload multiple images with controlled concurrency (e.g. 2-3 parallel uploads).
   * Ensures partial failures are tracked individually so users can retry failed ones.
   */
  async uploadMultipleImages(
    files: File[],
    resourceType: UploadResourceType,
    options?: MultiUploadOptions
  ): Promise<MultiUploadResultItem[]> {
    const results: MultiUploadResultItem[] = new Array(files.length);
    const concurrency = options?.concurrency || DEFAULT_CONCURRENCY;

    // Request signature once per batch (or per file if expired, but session signature is reusable within timestamp)
    let batchSignature: AdminUploadSignatureData | null = null;
    try {
      batchSignature = await this.requestUploadSignature(resourceType, options?.resourceId);
    } catch (sigErr) {
      const errMsg = sigErr instanceof Error ? sigErr.message : 'Gagal mendapatkan signature upload.';
      return files.map((_, idx) => {
        options?.onItemStatusChange?.(idx, 'failed', undefined, errMsg);
        return { index: idx, success: false, error: errMsg };
      });
    }

    let currentIndex = 0;

    const runWorker = async (): Promise<void> => {
      while (currentIndex < files.length) {
        if (options?.signal?.aborted) {
          break;
        }

        const index = currentIndex++;
        const file = files[index];

        options?.onItemStatusChange?.(index, 'uploading');
        options?.onItemProgress?.(index, 0);

        try {
          // 1. Validate
          const val = validateImageFile(
            file,
            batchSignature.allowedFormats || DEFAULT_ALLOWED_FORMATS,
            batchSignature.maxFileSize || DEFAULT_MAX_FILE_SIZE
          );
          if (!val.valid) {
            throw new Error(val.error);
          }

          // 2. Preprocess
          const processed = await preprocessImage(file);

          // 3. Direct upload
          const asset = await this.uploadToCloudinary(processed, batchSignature, {
            onProgress: (p) => options?.onItemProgress?.(index, p),
            signal: options?.signal,
            originalFilename: file.name,
          });

          // Set orderIndex
          asset.orderIndex = index;

          results[index] = { index, success: true, asset };
          options?.onItemStatusChange?.(index, 'uploaded', asset);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Upload gagal.';
          results[index] = { index, success: false, error: errMsg };
          options?.onItemStatusChange?.(index, 'failed', undefined, errMsg);
        }
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrency, files.length) },
      () => runWorker()
    );
    await Promise.all(workers);

    return results;
  },
};
