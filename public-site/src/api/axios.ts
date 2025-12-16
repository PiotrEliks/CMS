import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

// Backend base URL for static files (uploads)
export const BACKEND_URL = import.meta.env.VITE_API_BASE?.replace('/api/sites', '') || 'http://localhost:5001';

// Helper to get full URL for media/uploads
export function getMediaUrl(path: string): string {
  if (!path) return '';
  // If already absolute URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // If path starts with /uploads, prepend backend URL
  if (path.startsWith('/uploads')) {
    return `${BACKEND_URL}${path}`;
  }
  // Otherwise assume it's a local public asset
  return path;
}
