const USER_KEY = "auth_user_profile";
const DEV_TOKEN_KEY = "auth_dev_access_token";
const LEGACY_TOKEN_KEYS = ["auth_access_token", "token"];
const LEGACY_USER_KEYS = ["user"];

const isBrowser = () => typeof window !== "undefined";
const removeLegacyAuthStorage = () => {
  if (!isBrowser()) return;
  for (const key of [...LEGACY_TOKEN_KEYS, ...LEGACY_USER_KEYS]) {
    localStorage.removeItem(key);
  }
};

const canUseDevTokenFallback = () => {
  if (!isBrowser() || process.env.NODE_ENV === "production") {
    return false;
  }

  return window.location.protocol === "http:" && window.location.hostname === "localhost";
};

// Cookie session is handled by the backend (HttpOnly); only non-sensitive user profile is cached for UI.
export const setAuthSession = (user?: unknown, token?: string | null) => {
  if (!isBrowser()) return;
  removeLegacyAuthStorage();

  if (canUseDevTokenFallback()) {
    if (typeof token === "string" && token.trim()) {
      sessionStorage.setItem(DEV_TOKEN_KEY, token.trim());
    } else if (token === null) {
      sessionStorage.removeItem(DEV_TOKEN_KEY);
    }
  } else {
    sessionStorage.removeItem(DEV_TOKEN_KEY);
  }

  if (user === undefined || user === null) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;
  removeLegacyAuthStorage();
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(DEV_TOKEN_KEY);
};

export const getStoredUser = <T>() => {
  if (!isBrowser()) return null as T | null;
  removeLegacyAuthStorage();
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === "undefined" || raw === "null") {
    localStorage.removeItem(USER_KEY);
    return null as T | null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null as T | null;
  }
};

export const getDevAccessToken = () => {
  if (!canUseDevTokenFallback()) return null;

  const token = sessionStorage.getItem(DEV_TOKEN_KEY);
  if (!token || token === "undefined" || token === "null") {
    sessionStorage.removeItem(DEV_TOKEN_KEY);
    return null;
  }

  return token;
};
