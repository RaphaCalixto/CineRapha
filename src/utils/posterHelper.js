/**
 * Helper to wrap image URLs through the local backend poster proxy
 * to prevent browser CORS and hotlinking blocks from Amazon / IMDb CDNs.
 */
export function getPosterUrl(url) {
  if (!url) return null;
  if (url.startsWith('/api/')) return url;
  return `/api/poster-proxy?url=${encodeURIComponent(url)}`;
}
