const PRODUCTION_API_URL = "https://werehouse-production-f4f4.up.railway.app/api";
const DEVELOPMENT_API_URL = "http://localhost:5001/api";

export const DEFAULT_API_URL =
  process.env.NODE_ENV === "production" ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const normalizeApiUrl = (rawUrl?: string, fallback = DEFAULT_API_URL) => {
  const candidate = String(rawUrl || "").trim();
  const fallbackUrl = trimTrailingSlash(fallback);

  if (!candidate) {
    return fallbackUrl;
  }

  // Keep relative URLs as-is to support same-origin setups.
  if (candidate.startsWith("/")) {
    return trimTrailingSlash(candidate);
  }

  const withProtocol = /^https?:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;

  try {
    const parsed = new URL(withProtocol);
    const cleanPath = trimTrailingSlash(parsed.pathname || "");

    if (!cleanPath || cleanPath === "/") {
      parsed.pathname = "/api";
    } else if (!cleanPath.toLowerCase().startsWith("/api")) {
      parsed.pathname = `${cleanPath}/api`;
    } else {
      parsed.pathname = cleanPath;
    }

    return trimTrailingSlash(parsed.toString());
  } catch {
    return fallbackUrl;
  }
};

export const resolveApiUrl = (rawUrl?: string) => normalizeApiUrl(rawUrl, DEFAULT_API_URL);

