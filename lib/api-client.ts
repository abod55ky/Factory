import axios from 'axios';
import { clearAuthSession, getDevAccessToken } from '@/lib/auth-session';
import { resetAuthVerificationCache } from '@/lib/auth-verify';
import { useAuthStore } from '@/stores/auth-store';
import { DEFAULT_API_URL, normalizeApiUrl } from '@/lib/api-url';

const RESOLVED_API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_URL);
const USE_API_PROXY = /^https?:\/\//i.test(RESOLVED_API_URL);
const BASE_URL = USE_API_PROXY ? '/backend-api' : RESOLVED_API_URL;
const LOGIN_REDIRECT_COOLDOWN_MS = 1500;
let lastLoginRedirectAt = 0;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getDevAccessToken();
  if (!token) {
    return config;
  }

  const existingAuthHeader =
    typeof config.headers?.get === 'function'
      ? config.headers.get('Authorization')
      : (config.headers as Record<string, unknown> | undefined)?.Authorization;

  if (existingAuthHeader) {
    return config;
  }

  const headers =
    typeof config.headers?.set === 'function'
      ? config.headers
      : axios.AxiosHeaders.from(config.headers || {});

  headers.set('Authorization', `Bearer ${token}`);
  config.headers = headers;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      clearAuthSession();
      useAuthStore.getState().clear();
      resetAuthVerificationCache();

      const now = Date.now();
      const canRedirect = now - lastLoginRedirectAt > LOGIN_REDIRECT_COOLDOWN_MS;

      if (canRedirect && window.location.pathname !== '/login') {
        lastLoginRedirectAt = now;
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;