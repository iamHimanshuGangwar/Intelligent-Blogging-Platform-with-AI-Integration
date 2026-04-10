import ImageKit from "imagekit";

// Lazily-initialized singleton — avoids crashing at build-time when env vars
// are absent (Next.js collects page data without real env vars during `next build`).
let _instance: ImageKit | null = null;

export function getImageKitClient(): ImageKit {
  if (_instance) return _instance;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT."
    );
  }
  _instance = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return _instance;
}

// Default export kept for backward compatibility — lazy proxy so import still works.
export default getImageKitClient;

type ImageOptimizeOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'maintain_ratio' | 'force' | 'at_max';
};

/**
 * Returns an ImageKit URL with resize/quality transforms applied.
 * Falls back to the original URL if it is not hosted on ImageKit.
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizeOptions = {}
): string {
  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';
  if (!src || !endpoint || !src.startsWith(endpoint)) return src;

  const { width, height, quality = 80, format = 'auto', crop = 'maintain_ratio' } = options;

  const transforms: string[] = [`q-${quality}`, `f-${format}`];
  if (width) transforms.push(`w-${width}`);
  if (height) transforms.push(`h-${height}`);
  if (width || height) transforms.push(`c-${crop}`);

  const transformStr = transforms.join(',');

  // ImageKit URL pattern: {endpoint}/tr:{transforms}/{path}
  const path = src.replace(endpoint, '').replace(/^\//, '');
  return `${endpoint}/tr:${transformStr}/${path}`;
}

// Preset helpers for common use-cases
export const coverImage = (src: string) =>
  getOptimizedImageUrl(src, { width: 1200, height: 630, quality: 85, format: 'webp' });

export const thumbnailImage = (src: string) =>
  getOptimizedImageUrl(src, { width: 480, height: 270, quality: 80, format: 'webp' });

export const avatarImage = (src: string) =>
  getOptimizedImageUrl(src, { width: 96, height: 96, quality: 85, format: 'webp', crop: 'force' });
