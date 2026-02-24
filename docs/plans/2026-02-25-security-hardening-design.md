# Security Hardening Pass — Design Document

**Date:** 2026-02-25  
**Status:** Approved  
**Scope:** Authentication middleware, error sanitization, security headers, quick wins

---

## Context

Security audit found solid foundations (centralized `createAction` with auth+validation, Valibot schemas, layout guards, RBAC) but several gaps:

- 3 API routes return DB data with zero auth (`/api/gradelevels`, `/api/timeslots`, `/api/rooms/available`)
- Raw `error.message` (including Prisma internals) leaks to clients in production
- Missing security headers (CSP, HSTS, Permissions-Policy)
- No `middleware.ts` — each route must manually add auth (easy to forget)
- Base schedule layout doesn't enforce admin role
- Auth rate limit generous at 50/min

## Non-Goals

- Nonce-based CSP (breaks MUI/Emotion hydration)
- CORS configuration changes (same-origin default is correct)
- Changes to `$executeRawUnsafe` in seed script (hardcoded SQL, not user-facing)
- Per-API-route auth refactor (middleware covers the gap)
- Telemetry/health check route changes (left as-is)

---

## Section 1: Middleware — Authentication Safety Net

### Approach

Hybrid: `middleware.ts` enforces authentication (are you logged in?), while layout guards and per-route handlers enforce authorization (are you an admin?).

### Route Map

**Public (allow-list — pass through):**

| Route | Reason |
|---|---|
| `/` (exact) | Public homepage |
| `/teachers/**` | Public teacher timetable viewing |
| `/classes/**` | Public class timetable viewing |
| `/signin` | Auth page |
| `/forgot-password` | Auth page |
| `/reset-password` | Auth page |
| `/api/auth/**` | Better Auth internal |
| `/api/ping` | Health probe |
| `/api/telemetry/**` | Fire-and-forget telemetry |
| `/api/health/**` | Infra probes |
| `/_next/**`, static assets | Framework internals |

**Protected (everything else):**

| Route | Current Auth | Notes |
|---|---|---|
| `/dashboard/**` | Layout guard | Middleware adds safety net |
| `/management/**` | Layout guard + admin | Middleware adds safety net |
| `/schedule/**` | Layout guard + admin | Middleware adds safety net |
| `/api/gradelevels` | **None** | Fixed by middleware |
| `/api/timeslots` | **None** | Fixed by middleware |
| `/api/rooms/available` | **None** | Fixed by middleware |
| `/api/schedule/**` | Per-route auth | Middleware adds safety net |
| `/api/export/**` | Per-route auth + admin | Middleware adds safety net |
| `/api/admin/**` | Per-route auth + admin | Middleware adds safety net |
| `/api/teachers` | Per-route auth | Middleware adds safety net |

### Behavior

- **API routes** (`/api/*`): Return `401 { error: "Unauthorized" }` JSON
- **Page routes**: Redirect to `/signin`
- Session check via Better Auth session cookie

### File

New file: `src/middleware.ts`

Uses Next.js `middleware.ts` with `matcher` config to skip static assets. Contains an allow-list of public path patterns checked via regex/startsWith. For protected paths, checks the Better Auth session cookie (`better-auth.session_token`). If missing → 401/redirect.

---

## Section 2: Error Message Sanitization

### Problem

`action-wrapper.ts` and API route catch blocks pass raw `error.message` to clients. Prisma errors contain table names, column names, and query details.

### Fix

New utility: `src/shared/lib/error-sanitizer.ts`

```typescript
const SAFE_PATTERNS = [
  "not found", "conflict", "already exists",
  "forbidden", "permission", "locked",
  "validation", "invalid",
];

export function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "เกิดข้อผิดพลาดที่ไม่คาดคิด";

  const msg = error.message.toLowerCase();

  // Business logic errors are safe to forward
  if (SAFE_PATTERNS.some(p => msg.includes(p))) {
    return error.message;
  }

  // In development, forward for debugging
  if (process.env.NODE_ENV === "development") {
    return error.message;
  }

  // In production, return generic message (real error is logged server-side)
  return "เกิดข้อผิดพลาดภายในระบบ";
}
```

### Apply to

1. `src/shared/lib/action-wrapper.ts` — generic error catch block (affects all server actions)
2. `src/app/api/schedule/validate-drop/route.ts` — catch block ~L271
3. `src/app/api/schedule/auto-arrange/route.ts` — catch block ~L290

---

## Section 3: Security Headers

### Additions to `next.config.mjs`

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googleusercontent.com; font-src 'self'; connect-src 'self'; frame-ancestors 'none'` | XSS defense |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused APIs |

### Notes

- `'unsafe-inline'` for scripts is required by Next.js without nonce setup
- `'unsafe-inline'` for styles is required by MUI Emotion
- `frame-ancestors 'none'` is the modern equivalent of `X-Frame-Options: DENY`

---

## Section 4: Quick Wins

### 4.1 Schedule Layout Role Check

**File:** `src/app/schedule/layout.tsx`

Add `isAdminRole()` check after session check. The nested semester layout already enforces this, but the parent layout currently lets non-admin authenticated users see the route structure before being blocked deeper.

### 4.2 Auth Rate Limit

**File:** `src/lib/auth.ts`

Lower `rateLimit.max` from `50` → `20` per 60-second window. Still generous for normal use, tighter against brute-force.

### 4.3 `.env.local.disabled` Cleanup

Remove from git tracking, add to `.gitignore`. Contains placeholder values but sets a bad pattern for secret management.

---

## Testing Strategy

- **Middleware:** Manual test — verify public routes load without auth, protected routes redirect/401
- **Error sanitizer:** Unit test with Prisma-like error messages vs business logic errors
- **Security headers:** Verify with `curl -I` or browser DevTools Network tab
- **Quick wins:** Layout role check tested by existing E2E auth flows

---

## Risks

| Risk | Mitigation |
|---|---|
| Middleware blocks legitimate requests | Allow-list is explicit; static assets excluded via matcher |
| CSP breaks MUI/Next.js rendering | Using permissive `'unsafe-inline'` for both scripts and styles |
| Error sanitizer hides useful errors | Only in production; dev mode forwards all errors |
| Rate limit too aggressive | 20/min is still ~1 every 3 seconds; normal users won't hit it |
