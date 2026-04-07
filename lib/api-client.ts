import axios from 'axios';
import { clearAuthSession } from '@/lib/auth-session';
import { resetAuthVerificationCache } from '@/lib/auth-verify';
import { useAuthStore } from '@/stores/auth-store';

const DEFAULT_API_URL = 'https://werehouse-production-dabe.up.railway.app/api';
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
const LOGIN_REDIRECT_COOLDOWN_MS = 1500;
let lastLoginRedirectAt = 0;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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