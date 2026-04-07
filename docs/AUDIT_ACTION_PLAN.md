# Frontend Audit Findings and Action Plan

## Scope

- Framework: Next.js App Router + TypeScript
- Project path: `Factory`
- Audit type: architecture, security, performance, state, caching, testing, observability, DX

## Current Findings (Repo-Specific)

### Strengths

- Uses App Router with route groups (`app/(auth)`, `app/(dashboard)`), plus `layout`, `loading`, `error`, and `not-found` boundaries.
- TypeScript strict mode is enabled (`tsconfig.json`).
- CI already runs lint, type-check, and production build.
- Uses `next/font` (`Tajawal`) and React Query provider setup.

### Risks and Gaps

- Auth token is persisted in `localStorage` (`lib/auth-session.ts`), increasing XSS blast radius.
- Security headers existed but were incomplete (no CSP, HSTS, COOP/CORP before this pass).
- No observable test suite discovered (no unit/integration/e2e test files or test runner config).
- No production observability hooks found (`useReportWebVitals`, Sentry, OpenTelemetry not configured).
- No bundle analysis workflow was available for dependency and chunk-size triage.

## Changes Applied in This Pass

### 1) Security header hardening

Updated `next.config.ts`:

- Added `Content-Security-Policy` with restrictive defaults.
- Added `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy`.
- Added production-only `Strict-Transport-Security`.
- Kept `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Continued disabling `X-Powered-By`.
- Added API-origin-aware `connect-src` support via `NEXT_PUBLIC_API_URL`.

### 2) Performance audit tooling

Updated `package.json`:

- Added `analyze` script for bundle analysis (`ANALYZE=true next build`).
- Added dependency `@next/bundle-analyzer`.
- Added `audit:deps` script (`npm audit --audit-level=high`).

## Priority Backlog

### P0 (This week)

- Replace `localStorage` token strategy with secure HttpOnly cookie session from backend.
- Add input validation (e.g., `zod`) on all write endpoints/server handlers.
- Run `npm run analyze` and remove or lazy-load top heaviest chunks.
- Define route rendering strategy per page (SSR/ISR/static/client) and apply ISR where safe.

### P1 (Next 1-2 weeks)

- Add unit tests (Jest + RTL) for auth/session and critical dashboard UI flows.
- Add one e2e smoke test for login and dashboard load (Playwright or Cypress).
- Add `useReportWebVitals` publishing hook to analytics sink.
- Add Sentry integration for client/server exceptions.

### P2 (Next 2-4 weeks)

- Add OpenTelemetry instrumentation and export traces to chosen backend.
- Add CI perf budget checks (Lighthouse CI).
- Add dependency update automation (Dependabot or Renovate).

## Acceptance Criteria

- Security headers score A+ on [securityheaders.com](https://securityheaders.com).
- Core Web Vitals trend visible and stable (LCP, CLS, INP in production telemetry).
- CI blocks merges on lint, typecheck, build, and tests.
- No auth bearer token stored in browser local storage.
