import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  RefreshCw,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  UploadResourceType,
  CloudinaryAsset,
  UploadItem,
  UploadStatus,
} from '@/types/upload.types';
import {
  cloudinaryUploadService,
  validateImageFile,
  DEFAULT_ALLOWED_FORMATS,
  DEFAULT_MAX_FILE_SIZE,
} from '@/lib/services/cloudinary-upload.service';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface ImageUploaderProps {
  /** Target backend resource type for folder isolation & signature */
  resourceType: UploadResourceType;
  /** Optional existing entity ID */
  resourceId?: string | null;
  /** Allow single or multiple image uploads */
  multiple?: boolean;
  /** Maximum number of files for multiple mode (default: 10) */
  maxFiles?: number;
  /** Maximum file size in bytes (default: 10MB) */
  maxSizeBytes?: number;
  /** Component label */
  label?: string;
  /** Helper text / description */
  description?: string;
  /** Validation error message from form schema */
  error?: string;
  /** Disable uploading and editing */
  disabled?: boolean;
  /** Show optional caption and altText fields in multiple mode */
  showCaptionFields?: boolean;
  /** Current value: CloudinaryAsset (or url string) for single, CloudinaryAsset[] for multiple */
  value?: CloudinaryAsset | (CloudinaryAsset | string)[] | string | null;
  /** Change callback */
  onChange?: (value: any) => void;
  /** Callback to notify parent form if an upload is currently in progress */
  onUploadingChange?: (isUploading: boolean) => void;
  /** Additional container classes */
  className?: string;
}

export function ImageUploader({
  resourceType,
  resourceId,
  multiple = false,
  maxFiles = 10,
  maxSizeBytes = DEFAULT_MAX_FILE_SIZE,
  label,
  description,
  error,
  disabled = false,
  showCaptionFields = false,
  value,
  onChange,
  onUploadingChange,
  className,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Active upload queue for multiple files or pending uploads
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  // Single file direct upload state
  const [singleUploading, setSingleUploading] = useState(false);
  const [singleProgress, setSingleProgress] = useState(0);
  const [singleAbortCtrl, setSingleAbortCtrl] = useState<AbortController | null>(null);

  // Normalize current assets from `value`
  const getNormalizedAssets = useCallback((): CloudinaryAsset[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item, idx) => {
        if (typeof item === 'string') {
          return {
            publicId: `legacy_${idx}`,
            secureUrl: item,
            resourceType: 'image',
            orderIndex: idx,
            isPrimary: idx === 0,
          };
        }
        return {
          ...item,
          orderIndex: item.orderIndex ?? idx,
          isPrimary: item.isPrimary ?? idx === 0,
        };
      });
    }
    if (typeof value === 'string') {
      return [
        {
          publicId: 'legacy_single',
          secureUrl: value,
          resourceType: 'image',
          isPrimary: true,
          orderIndex: 0,
        },
      ];
    }
    return [
      {
        ...value,
        isPrimary: value.isPrimary ?? true,
        orderIndex: value.orderIndex ?? 0,
      },
    ];
  }, [value]);

  const assets = getNormalizedAssets();

  // Check if any upload is in progress
  const hasActiveUploads =
    singleUploading ||
    uploadQueue.some((item) => item.status === 'uploading' || item.status === 'pending');

  useEffect(() => {
    onUploadingChange?.(hasActiveUploads);
  }, [hasActiveUploads, onUploadingChange]);

  // Clean up abort controllers on unmount
  useEffect(() => {
    return () => {
      singleAbortCtrl?.abort();
      uploadQueue.forEach((item) => item.abortController?.abort());
    };
  }, [singleAbortCtrl, uploadQueue]);

  // Handle single file upload
  const handleSingleUpload = async (file: File) => {
    setLocalError(null);
    const validation = validateImageFile(file, DEFAULT_ALLOWED_FORMATS, maxSizeBytes);
    if (!validation.valid) {
      setLocalError(validation.error || 'Format atau ukuran file tidak valid.');
      return;
    }

    const abortCtrl = new AbortController();
    setSingleAbortCtrl(abortCtrl);
    setSingleUploading(true);
    setSingleProgress(0);

    try {
      const asset = await cloudinaryUploadService.uploadSingleImage(file, resourceType, {
        resourceId,
        signal: abortCtrl.signal,
        onProgress: (pct) => setSingleProgress(pct),
      });

      asset.isPrimary = true;
      asset.orderIndex = 0;
      onChange?.(asset);
    } catch (err: unknown) {
      if (abortCtrl.signal.aborted) {
        setLocalError('Upload dibatalkan.');
      } else {
        const msg = err instanceof Error ? err.message : 'Upload gagal. Silakan coba lagi.';
        setLocalError(msg);
      }
    } finally {
      setSingleUploading(false);
      setSingleAbortCtrl(null);
    }
  };

  // Handle multiple files upload with concurrency and duplicate prevention
  const handleMultipleUpload = async (newFiles: File[]) => {
    setLocalError(null);

    const currentTotal = assets.length + uploadQueue.filter((i) => i.status !== 'failed').length;
    if (currentTotal + newFiles.length > maxFiles) {
      setLocalError(`Maksimal ${maxFiles} foto diperbolehkan.`);
      return;
    }

    // Filter duplicates
    const existingNames = new Set([
      ...assets.map((a) => a.originalFilename?.toLowerCase()).filter(Boolean),
      ...uploadQueue.map((u) => u.name.toLowerCase()),
    ]);

    const filesToUpload: File[] = [];
    for (const file of newFiles) {
      if (existingNames.has(file.name.toLowerCase())) {
        continue; // skip duplicate file name
      }
      const val = validateImageFile(file, DEFAULT_ALLOWED_FORMATS, maxSizeBytes);
      if (!val.valid) {
        setLocalError(val.error || `File ${file.name} tidak valid.`);
        return;
      }
      existingNames.add(file.name.toLowerCase());
      filesToUpload.push(file);
    }

    if (filesToUpload.length === 0) {
      return;
    }

    // Initialize items in upload queue
    const queueItems: UploadItem[] = filesToUpload.map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      status: 'pending' as UploadStatus,
      progress: 0,
      abortController: new AbortController(),
    }));

    setUploadQueue((prev) => [...prev, ...queueItems]);

    // Upload with concurrency 2
    try {
      const results = await cloudinaryUploadService.uploadMultipleImages(
        filesToUpload,
        resourceType,
        {
          resourceId,
          concurrency: 2,
          onItemProgress: (index, progress) => {
            const item = queueItems[index];
            if (!item) return;
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress } : q))
            );
          },
          onItemStatusChange: (index, status, asset, errorMsg) => {
            const item = queueItems[index];
            if (!item) return;
            setUploadQueue((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? { ...q, status, asset, error: errorMsg, progress: status === 'uploaded' ? 100 : q.progress }
                  : q
              )
            );
          },
        }
      );

      // Collect successfully uploaded assets
      const successfulAssets: CloudinaryAsset[] = [];
      const successfulQueueIds = new Set<string>();

      results.forEach((res) => {
        if (res.success && res.asset) {
          successfulAssets.push(res.asset);
          successfulQueueIds.add(queueItems[res.index].id);
        }
      });

      // Merge new assets into existing assets
      if (successfulAssets.length > 0) {
        const nextAssets = [...assets, ...successfulAssets].map((item, idx) => ({
          ...item,
          orderIndex: idx,
          isPrimary: idx === 0, // First item is primary if none selected
        }));

        onChange?.(nextAssets);

        // Remove successful items from upload queue, keep failed items for retry
        setUploadQueue((prev) => prev.filter((q) => !successfulQueueIds.has(q.id)));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sebagian upload gagal.';
      setLocalError(msg);
    }
  };

  // Retry a single failed item from uploadQueue
  const handleRetryItem = async (itemId: string) => {
    const item = uploadQueue.find((q) => q.id === itemId);
    if (!item || !item.file) return;

    setUploadQueue((prev) =>
      prev.map((q) =>
        q.id === itemId
          ? { ...q, status: 'uploading' as UploadStatus, progress: 0, error: undefined }
          : q
      )
    );

    try {
      const asset = await cloudinaryUploadService.uploadSingleImage(item.file, resourceType, {
        resourceId,
        signal: item.abortController?.signal,
        onProgress: (progress) => {
          setUploadQueue((prev) =>
            prev.map((q) => (q.id === itemId ? { ...q, progress } : q))
          );
        },
      });

      // Successful retry: add to assets and remove from queue
      const nextAssets = [...assets, asset].map((a, idx) => ({
        ...a,
        orderIndex: idx,
        isPrimary: idx === 0,
      }));

      onChange?.(nextAssets);
      setUploadQueue((prev) => prev.filter((q) => q.id !== itemId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Retry gagal.';
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === itemId ? { ...q, status: 'failed' as UploadStatus, error: msg } : q
        )
      );
    }
  };

  // Remove an item from uploadQueue
  const handleRemoveQueueItem = (itemId: string) => {
    const item = uploadQueue.find((q) => q.id === itemId);
    item?.abortController?.abort();
    setUploadQueue((prev) => prev.filter((q) => q.id !== itemId));
  };

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    if (multiple) {
      handleMultipleUpload(Array.from(fileList));
    } else {
      handleSingleUpload(fileList[0]);
    }

    // Reset input so same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !hasActiveUploads) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || hasActiveUploads) return;

    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length === 0) return;

    if (multiple) {
      handleMultipleUpload(files);
    } else {
      handleSingleUpload(files[0]);
    }
  };

  // Asset actions for multiple mode
  const handleRemoveAsset = (index: number) => {
    const next = assets.filter((_, idx) => idx !== index);
    const updated = next.map((item, idx) => ({
      ...item,
      orderIndex: idx,
      isPrimary: idx === 0, // Ensure primary is always the first item
    }));
    onChange?.(multiple ? updated : null);
  };

  const handleSetPrimary = (index: number) => {
    const target = assets[index];
    if (!target) return;
    // Move primary item to index 0
    const remaining = assets.filter((_, idx) => idx !== index);
    const reordered = [target, ...remaining].map((item, idx) => ({
      ...item,
      orderIndex: idx,
      isPrimary: idx === 0,
    }));
    onChange?.(reordered);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= assets.length) return;

    const next = [...assets];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    const reordered = next.map((item, idx) => ({
      ...item,
      orderIndex: idx,
      isPrimary: idx === 0,
    }));
    onChange?.(reordered);
  };

  const handleUpdateCaption = (index: number, caption: string) => {
    const next = assets.map((item, idx) => (idx === index ? { ...item, caption } : item));
    onChange?.(next);
  };

  const handleUpdateAltText = (index: number, altText: string) => {
    const next = assets.map((item, idx) => (idx === index ? { ...item, altText } : item));
    onChange?.(next);
  };

  const activeError = error || localError;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label and description */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            {label}
            {multiple && (
              <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                ({assets.length}/{maxFiles})
              </span>
            )}
          </label>
        </div>
      )}
      {description && <p className="text-[11px] text-slate-500">{description}</p>}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={DEFAULT_ALLOWED_FORMATS.map((f) => `.${f}`).join(',')}
        multiple={multiple}
        disabled={disabled || hasActiveUploads}
        onChange={handleFileChange}
        className="hidden"
        id={`image-upload-${resourceType}`}
      />

      {/* ==================================================================== */}
      {/* SINGLE IMAGE MODE */}
      {/* ==================================================================== */}
      {!multiple && (
        <div>
          {/* Upload progress state */}
          {singleUploading && (
            <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-emerald-700 font-medium text-xs mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>Mengunggah gambar ke Cloudinary... ({singleProgress}%)</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${singleProgress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => singleAbortCtrl?.abort()}
                className="mt-2 text-[11px] text-slate-500 hover:text-rose-600 cursor-pointer underline"
              >
                Batalkan Upload
              </button>
            </div>
          )}

          {/* Existing Single Image Preview */}
          {!singleUploading && assets.length > 0 && assets[0]?.secureUrl && (
            <div className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xs max-w-sm">
              <img
                src={assets[0].secureUrl}
                alt={assets[0].altText || assets[0].caption || 'Uploaded Preview'}
                className="h-48 w-full object-cover transition-opacity group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 p-2.5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Gambar Utama
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onChange?.(null);
                      setLocalError(null);
                    }}
                    disabled={disabled}
                    className="p-1 rounded-md bg-rose-600/90 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    title="Hapus foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-200 truncate max-w-[200px]">
                    {assets[0].originalFilename || assets[0].publicId}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="h-6 text-[11px] bg-white/90 hover:bg-white text-slate-800"
                  >
                    Ganti Foto
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Single Dropzone / Empty State */}
          {!singleUploading && assets.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !disabled && fileInputRef.current?.click()}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300',
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <div className="mb-2 rounded-full bg-emerald-100 p-2 text-emerald-600">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Pilih atau seret gambar ke sini
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mendukung format JPG, PNG, atau WebP (Maks. {(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MULTIPLE IMAGES MODE */}
      {/* ==================================================================== */}
      {multiple && (
        <div className="space-y-3">
          {/* Dropzone for adding more files */}
          {assets.length + uploadQueue.length < maxFiles && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !disabled && !hasActiveUploads && fileInputRef.current?.click()}
              className={cn(
                'relative flex items-center justify-center space-x-2 rounded-xl border-2 border-dashed py-4 px-3 text-center transition-colors cursor-pointer',
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300',
                (disabled || hasActiveUploads) && 'opacity-60 cursor-not-allowed'
              )}
            >
              <UploadCloud className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-700">
                + Tambah Foto (Drag & Drop atau klik di sini)
              </span>
              <span className="text-[10px] text-slate-400">
                • Maks. {(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB per foto
              </span>
            </div>
          )}

          {/* Active Uploading / Failed Queue Items */}
          {uploadQueue.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-semibold text-slate-700">
                Proses Upload Cloudinary ({uploadQueue.length})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-lg border text-xs',
                      item.status === 'uploading' && 'border-emerald-200 bg-emerald-50/40',
                      item.status === 'failed' && 'border-rose-200 bg-rose-50/40',
                      item.status === 'pending' && 'border-slate-200 bg-slate-50'
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5 mb-1">
                        {item.status === 'uploading' && (
                          <Loader2 className="h-3 w-3 animate-spin text-emerald-600 shrink-0" />
                        )}
                        {item.status === 'failed' && (
                          <AlertCircle className="h-3 w-3 text-rose-600 shrink-0" />
                        )}
                        <span className="font-medium text-slate-800 truncate">{item.name}</span>
                      </div>
                      {item.status === 'uploading' && (
                        <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-200"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      {item.status === 'failed' && (
                        <span className="text-[10px] text-rose-600 truncate block">
                          {item.error || 'Gagal diunggah'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.status === 'failed' && (
                        <button
                          type="button"
                          onClick={() => handleRetryItem(item.id)}
                          className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer"
                          title="Coba lagi"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveQueueItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Batal / Hapus"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Gallery Grid */}
          {assets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {assets.map((asset, index) => (
                <div
                  key={asset.publicId || asset.secureUrl || index}
                  className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xs flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative h-28 w-full bg-slate-800 overflow-hidden">
                    <img
                      src={asset.secureUrl}
                      alt={asset.altText || asset.caption || `Foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {/* Primary Badge or Set Primary Button */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      {asset.isPrimary ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white shadow-xs">
                          <Star className="h-2.5 w-2.5 mr-0.5 fill-white" /> Foto Utama
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/70 hover:bg-black text-white cursor-pointer"
                          title="Jadikan Foto Utama"
                        >
                          Set Utama
                        </button>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveAsset(index)}
                      className="absolute top-1.5 right-1.5 z-10 p-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Hapus foto ini"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {/* Reorder buttons */}
                    <div className="absolute bottom-1.5 right-1.5 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          className="p-1 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                          title="Pindah ke kiri/atas"
                        >
                          <ArrowUp className="h-2.5 w-2.5" />
                        </button>
                      )}
                      {index < assets.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          className="p-1 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                          title="Pindah ke kanan/bawah"
                        >
                          <ArrowDown className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Optional Caption & Alt Text Fields */}
                  {showCaptionFields && (
                    <div className="p-2 bg-white space-y-1.5 border-t border-slate-100">
                      <input
                        type="text"
                        placeholder="Keterangan foto..."
                        value={asset.caption || ''}
                        onChange={(e) => handleUpdateCaption(index, e.target.value)}
                        className="w-full text-[11px] px-1.5 py-0.5 border border-slate-200 rounded focus:border-emerald-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Alt text..."
                        value={asset.altText || ''}
                        onChange={(e) => handleUpdateAltText(index, e.target.value)}
                        className="w-full text-[11px] px-1.5 py-0.5 border border-slate-200 rounded focus:border-emerald-500 focus:outline-none text-slate-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error message banner */}
      {activeError && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
