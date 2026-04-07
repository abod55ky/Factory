const USER_KEY = "auth_user_profile";

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
