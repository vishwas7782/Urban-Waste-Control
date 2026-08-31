// Uploaded images are stored as absolute URLs by newer records and as paths by
// older ones, so relative values get resolved against the API base.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function resolveImg(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}
