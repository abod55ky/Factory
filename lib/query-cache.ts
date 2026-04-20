export const QUERY_STALE_TIME = {
  FAST: 30 * 1000,
  STANDARD: 2 * 60 * 1000,
  RELAXED: 5 * 60 * 1000,
} as const;

export const QUERY_GC_TIME = {
  STANDARD: 15 * 60 * 1000,
  RELAXED: 30 * 60 * 1000,
} as const;

