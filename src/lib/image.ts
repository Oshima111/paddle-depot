/**
 * Image URL helper for Paddle Depot.
 *
 * Handles two types of image paths:
 * 1. Relative paths like `/paddles/Q2.png` — served from the `public/` directory
 * 2. Absolute Supabase Storage URLs like `https://*.supabase.co/storage/v1/object/public/paddles/...`
 *
 * Products without a valid image should display the Paddle Depot logo as fallback.
 */
export const FALLBACK_IMAGE = '/paddle-depot-logo.png';

/**
 * Returns the best available image URL for a product.
 * Falls back to the Paddle Depot logo if the image is empty, null, or undefined.
 */
export function getProductImageUrl(image: string | null | undefined): string {
  if (!image || image.trim() === '') {
    return FALLBACK_IMAGE;
  }
  return image;
}

/**
 * Returns an onError handler for product images.
 * Falls back to the Paddle Depot logo on any image load error.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_IMAGE) {
    console.warn(`[Image] Failed to load: ${img.src}, falling back to logo`);
    img.src = FALLBACK_IMAGE;
  }
}

