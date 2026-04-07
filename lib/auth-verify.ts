import axios from "axios";
import apiClient from "@/lib/api-client";

const SUCCESS_TTL_MS = 10_000;
const FAILURE_TTL_MS = 1_500;
const RATE_LIMIT_COOLDOWN_MS = 15_000;

type VerifyResult = {
  authorized: boolean;
  status?: number;
  rateLimited?: boolean;
  fromCache?: boolean;
};

let inFlightVerification: Promise<VerifyResult> | null = null;
let cachedResult: VerifyResult | null = null;
let cacheExpiresAt = 0;
let blockedUntil = 0;

const now = () => Date.now();

const hasFreshCache = () => Boolean(cachedResult) && cacheExpiresAt > now();

export const resetAuthVerificationCache = () => {
  inFlightVerification = null;
  cachedResult = null;
  cacheExpiresAt = 0;
  blockedUntil = 0;
};

export const verifyAuthSession = async (options?: { force?: boolean }) => {
  const force = options?.force === true;
  const currentTime = now();

  if (!force && blockedUntil > currentTime) {
    return { authorized: false, status: 429, rateLimited: true, fromCache: true };
  }

  if (!force && hasFreshCache()) {
    return {
      ...(cachedResult as VerifyResult),
      fromCache: true,
    };
  }

  if (!force && inFlightVerification) {
    return inFlightVerification;
  }

  inFlightVerification = (async () => {
    try {
      await apiClient.get("/auth/me");
      cachedResult = { authorized: true };
      cacheExpiresAt = now() + SUCCESS_TTL_MS;
      blockedUntil = 0;
      return { authorized: true };
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      cachedResult = { authorized: false, status };
      cacheExpiresAt = now() + FAILURE_TTL_MS;

      if (status === 429) {
        blockedUntil = now() + RATE_LIMIT_COOLDOWN_MS;
        cachedResult = { authorized: false, status, rateLimited: true };
      }

      return cachedResult;
    } finally {
      inFlightVerification = null;
    }
  })();

  return inFlightVerification;
};
