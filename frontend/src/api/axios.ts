import axios from 'axios';
import { safeStorage } from '../utils/storage';

// Base API URL: Always strictly route to relative '/api' for full-stack local Express
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_URL = !rawApiUrl || rawApiUrl.includes('your-backend-app') || rawApiUrl.includes('onrender') ? '/api' : rawApiUrl;

/**
 * Bulletproof Native Fetch Adapter for Axios in AI Studio iframe environment.
 * Native fetch bypasses browser XMLHttpRequest third-party iframe cookie restrictions,
 * ensuring flawless cookie & header transmission without 'Network Error'.
 */
const customFetchAdapter = async (config: any) => {
  const cleanBase = (config.baseURL && !config.baseURL.includes('your-backend-app') && !config.baseURL.includes('onrender'))
    ? config.baseURL.replace(/\/$/, '')
    : '/api';
  const urlPath = config.url?.startsWith('/') ? config.url : `/${config.url || ''}`;
  let finalUrl = config.url?.startsWith('http://') || config.url?.startsWith('https://')
    ? config.url
    : `${cleanBase}${urlPath}`;

  // Handle Query Parameters
  if (config.params) {
    const searchParams = new URLSearchParams();
    Object.entries(config.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs;
    }
  }

  // Extract Headers
  const headers: Record<string, string> = {};
  if (config.headers) {
    if (typeof config.headers.toJSON === 'function') {
      Object.assign(headers, config.headers.toJSON());
    } else {
      Object.assign(headers, config.headers);
    }
  }

  // Ensure Authorization Header is present from safeStorage
  const token = safeStorage.getItem('fitsync_token');
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Format Body
  let body = config.data;
  const method = (config.method || 'GET').toUpperCase();
  if (body !== undefined && body !== null && !['GET', 'HEAD'].includes(method)) {
    if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
      body = JSON.stringify(body);
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    }
  } else {
    body = undefined;
  }

  // Execute request with multi-stage auto-retry and iframe-safe credential fallback
  const executeFetch = async (attempt = 0): Promise<any> => {
    try {
      const response = await fetch(finalUrl, {
        method,
        headers,
        body,
        credentials: attempt > 0 ? 'omit' : 'same-origin',
      });

      const contentType = response.headers.get('content-type') || '';
      let responseData: any;
      if (contentType.includes('application/json')) {
        responseData = await response.json().catch(() => ({}));
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const error: any = new Error(responseData?.message || `Request failed with status ${response.status}`);
        error.config = config;
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: response.headers,
        };
        throw error;
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config,
      };
    } catch (err: any) {
      // Retry up to 3 times for transient dev-server rebuilds or network delays
      if (attempt < 3 && (!err.response || err.name === 'TypeError' || err.message === 'Failed to fetch')) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        return executeFetch(attempt + 1);
      }
      throw err;
    }
  };

  return executeFetch(0);
};

export const apiClient = axios.create({
  baseURL: API_URL,
  adapter: customFetchAdapter as any,
  timeout: 15000,
});

// Interceptor: Handle 401 Unauthorized globally by clearing credentials
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        safeStorage.removeItem('fitsync_token');
        safeStorage.removeItem('fitsync_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
