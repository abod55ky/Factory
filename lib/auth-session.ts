const USER_KEY = "auth_user_profile";
const ACCESS_TOKEN_KEY = "auth_access_token";

const isBrowser = () => typeof window !== "undefined";
// Cookie session is handled by the backend (HttpOnly); only non-sensitive user profile is cached for UI.
export const setAuthSession = (user?: unknown) => {
  if (!isBrowser()) return;
  if (user === undefined || user === null) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const setAuthAccessToken = (token?: string | null) => {
  if (!isBrowser()) return;
  if (!token || !token.trim()) {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token.trim());
};

export const getAuthAccessToken = () => {
  if (!isBrowser()) return "";
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
};

export const clearAuthAccessToken = () => {
  if (!isBrowser()) return;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getStoredUser = <T>() => {
  if (!isBrowser()) return null as T | null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === "undefined" || raw === "null") return null as T | null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null as T | null;
  }
};

