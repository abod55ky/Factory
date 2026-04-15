# Data Fetching System (Production-Ready Baseline)

This document describes the new baseline added to the project for stable, typed, and scalable data fetching.

## What was added

- `lib/config/env.ts`
  - Validates public runtime env vars with Zod.
  - Provides a safe fallback for `NEXT_PUBLIC_API_URL`.

- `lib/errors/app-error.ts`
  - Unified `AppError` type.
  - `toAppError()` converts Axios/unknown errors to a predictable shape.

- `lib/query-client.ts`
  - Central `createQueryClient()` with production defaults.
  - Smart retry strategy:
    - Retries network and server errors.
    - Avoids retrying most 4xx errors.

- `components/Providers.tsx`
  - Uses the shared query client factory.
  - Keeps `react-hot-toast` compatibility.
  - Adds `sonner` toaster for future modules.
  - Enables React Query Devtools in development.

- `lib/query-keys.ts`
  - Shared query key factory to avoid key drift across hooks.

- `lib/http/api.ts`
  - Typed `get/post/patch/delete` wrappers that unwrap `response.data`.

- `hooks/useDashboard.ts`
  - Migrated to use `queryKeys` + typed `api` wrappers.

## Recommended hook pattern

Use this structure for new hooks:

1. Define key in `lib/query-keys.ts`.
2. Fetch through `lib/http/api.ts`.
3. Let defaults come from `lib/query-client.ts`.
4. Use `toAppError()` only when you need custom UI behavior.

## Migration checklist for existing hooks

- [x] `useDashboard` migrated.
- [x] `useEmployees` migrated.
- [x] `useInventory` / `useProducts` migrated.
- [x] `useAttendance` migrated.
- [x] `usePayroll` migrated.
- [x] `useImports` migrated.
- [x] `useSalaries` migrated.
- [x] `useAdvances` migrated.
- [x] `useBonuses` migrated.

## Notes

- Current setup is intentionally backward compatible with existing code.
- Existing pages and hooks should continue to work without route changes.
