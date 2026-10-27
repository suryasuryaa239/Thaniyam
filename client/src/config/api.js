/**
 * Production-ready API URL Resolver for Thaniyam Treats
 * 
 * Supports:
 * 1. Unified full-stack hosting: Defaults to relative '/api' endpoints
 * 2. Decoupled hosting (e.g. Vercel frontend + Render/Railway backend):
 *    Prefixes with VITE_API_BASE_URL if configured in environment settings.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL || '/';
  // If absolute URL is already passed, return it directly
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default apiUrl;
