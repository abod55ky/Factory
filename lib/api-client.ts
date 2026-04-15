import axios from 'axios';
import { clearAuthAccessToken, clearAuthSession, getAuthAccessToken } from '@/lib/auth-session';
import { resetAuthVerificationCache } from '@/lib/auth-verify';
import { useAuthStore } from '@/stores/auth-store';

const DEFAULT_API_URL = 'https://werehouse-production-f4f4.up.railway.app/api';
const isBrowser = typeof window !== 'undefined';
const serverApiUrl = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
const BASE_URL = isBrowser ? '/api' : serverApiUrl;
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
  const token = getAuthAccessToken();
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      clearAuthAccessToken();
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