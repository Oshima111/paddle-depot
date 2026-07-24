import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Determine if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

/**
 * Allowed MIME types for paddle image uploads.
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Maximum file size for paddle images: 5MB.
 */
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Storage bucket name for paddle images.
 */
const STORAGE_BUCKET = 'paddles';

/**
 * Uploads a paddle image file to Supabase Storage and returns the public URL.
 *
 * Steps:
 * 1. Validates the file type and size.
 * 2. Generates a unique file path using timestamp + random string.
 * 3. Uploads to the 'paddles' bucket with upsert: true.
 * 4. Retrieves and returns the public URL.
 * 5. Optionally deletes the old image from storage (if it was a Supabase URL).
 *
 * Logs every step to the browser console for debugging.
 *
 * @param file - The image File object from the file input.
 * @param oldImageUrl - Optional. The previous image URL to clean up if it's a Supabase Storage URL.
 * @returns The public Supabase Storage URL of the uploaded image.
 * @throws If validation fails or the upload fails.
 */
export async function uploadProductImage(
  file: File,
  oldImageUrl?: string | null
): Promise<string> {
  console.log('[Image Upload] Starting upload...');
  console.log('[Image Upload] Selected file:', file.name, `(${(file.size / 1024).toFixed(1)} KB, ${file.type})`);

  // --- Validate file type ---
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    const msg = `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.`;
    console.error('[Image Upload] Validation failed:', msg);
    throw new Error(msg);
  }

  // --- Validate file size ---
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const msg = `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`;
    console.error('[Image Upload] Validation failed:', msg);
    throw new Error(msg);
  }

  // --- Generate a unique storage path ---
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  const uniquePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${sanitizedName}`;
  const fullStoragePath = `${uniquePath}`;
  console.log('[Image Upload] Upload path:', fullStoragePath);

  // --- Upload to Supabase Storage ---
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fullStoragePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('[Image Upload] Supabase upload error:', uploadError);
    const statusCode = String((uploadError as any).statusCode ?? '');
    let errorMessage = `Image upload failed: ${uploadError.message || 'Unknown error'}`;

    if (statusCode === '403' || (uploadError.message && uploadError.message.toLowerCase().includes('policy'))) {
      errorMessage +=
        '\n\nCheck your Storage RLS policies. The admin user needs INSERT permission on the "paddles" bucket.';
    } else if (statusCode === '401') {
      errorMessage += '\n\nYour session may have expired. Try logging out and back in.';
    } else if ((uploadError.message && uploadError.message.includes('duplicate')) || statusCode === '409') {
      errorMessage += '\n\nA file with this name already exists. Please try again.';
    }

    throw new Error(errorMessage);
  }

  console.log('[Image Upload] Upload succeeded:', uploadData);

  // --- Get the public URL ---
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path);
  const publicUrl = urlData.publicUrl;

  if (!publicUrl) {
    throw new Error('Upload succeeded, but could not retrieve public URL.');
  }

  console.log('[Image Upload] Public URL:', publicUrl);

  // --- Optionally delete the old image if it was a Supabase Storage URL ---
  if (oldImageUrl && oldImageUrl.includes('supabase.co/storage/v1/object/public/paddles/')) {
    try {
      // Extract the storage path from the old public URL
      // URL format: https://<project>.supabase.co/storage/v1/object/public/paddles/<path>
      const segments = oldImageUrl.split('/paddles/');
      if (segments.length >= 2) {
        const oldPath = segments[segments.length - 1];
        console.log('[Image Upload] Deleting old image:', oldPath);

        const { error: deleteError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([oldPath]);

        if (deleteError) {
          // Non-critical: log warning but don't fail the upload
          console.warn('[Image Upload] Failed to delete old image (non-critical):', deleteError.message);
        } else {
          console.log('[Image Upload] Old image deleted successfully');
        }
      }
    } catch (cleanupError) {
      console.warn('[Image Upload] Error during old image cleanup (non-critical):', cleanupError);
    }
  } else if (oldImageUrl) {
    console.log('[Image Upload] Old image is a local path, skipping storage cleanup:', oldImageUrl);
  }

  console.log('[Image Upload] Complete. Final URL:', publicUrl);
  return publicUrl;
}
