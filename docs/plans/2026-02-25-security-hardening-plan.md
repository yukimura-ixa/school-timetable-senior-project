# Security Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden the application with authentication middleware, error sanitization, security headers, and quick wins.

**Architecture:** Deny-by-default middleware using Better Auth's `getSessionCookie` for optimistic session checks, with a centralized error sanitizer utility applied to the `createAction` wrapper and API route catch blocks.

**Tech Stack:** Next.js 16, Better Auth (`getSessionCookie` from `better-auth/cookies`), TypeScript, Vitest

---

### Task 1: Create Error Sanitizer Utility

**Files:**
- Create: `src/shared/lib/error-sanitizer.ts`

**Step 1: Write the implementation**

```typescript
/**
 * Sanitize error messages to prevent leaking internal details (table names,
 * column names, query details) to clients in production.
 *
 * Business logic errors (not found, conflict, forbidden, etc.) are safe to
 * forward. Prisma/infrastructure errors are replaced with a generic Thai
 * message in production; development mode forwards everything for debugging.
 */

const SAFE_PATTERNS = [
  "not found",
  "conflict",
  "already exists",
  "forbidden",
  "permission",
  "locked",
  "validation",
  "invalid",
  "ไม่พบ",
  "ซ้ำ",
  "ไม่มีสิทธิ์",
  "ถูกล็อค",
] as const;

export function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "เกิดข้อผิดพลาดที่ไม่คาดคิด";

  const msg = error.message.toLowerCase();

  // Business logic errors are safe to forward
  if (SAFE_PATTERNS.some((p) => msg.includes(p))) {
    return error.message;
  }

  // In development, forward everything for debugging
  if (process.env.NODE_ENV === "development") {
    return error.message;
  }

  // In production, return generic message (real error already logged server-side)
  return "เกิดข้อผิดพลาดภายในระบบ";
}
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/lib/error-sanitizer.ts
git commit -m "feat: add error sanitizer utility for production error messages"
```

---

### Task 2: Write Unit Tests for Error Sanitizer

**Files:**
- Create: `__test__/lib/error-sanitizer.test.ts`

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { sanitizeErrorMessage } from "@/shared/lib/error-sanitizer";

describe("sanitizeErrorMessage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns generic Thai message for non-Error values", () => {
    expect(sanitizeErrorMessage("string error")).toBe(
      "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    );
    expect(sanitizeErrorMessage(null)).toBe("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    expect(sanitizeErrorMessage(42)).toBe("เกิดข้อผิดพลาดที่ไม่คาดคิด");
  });

  it("forwards business logic errors containing safe patterns", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(sanitizeErrorMessage(new Error("Teacher not found"))).toBe(
      "Teacher not found",
    );
    expect(sanitizeErrorMessage(new Error("Schedule conflict detected"))).toBe(
      "Schedule conflict detected",
    );
    expect(sanitizeErrorMessage(new Error("Record already exists"))).toBe(
      "Record already exists",
    );
    expect(sanitizeErrorMessage(new Error("Access forbidden"))).toBe(
      "Access forbidden",
    );
    expect(sanitizeErrorMessage(new Error("Timeslot is locked"))).toBe(
      "Timeslot is locked",
    );
    expect(sanitizeErrorMessage(new Error("Validation failed"))).toBe(
      "Validation failed",
    );
  });

  it("forwards Thai business logic errors", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(sanitizeErrorMessage(new Error("ไม่พบข้อมูล"))).toBe("ไม่พบข้อมูล");
    expect(sanitizeErrorMessage(new Error("ข้อมูลซ้ำ"))).toBe("ข้อมูลซ้ำ");
  });

  it("sanitizes Prisma-like errors in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(
      sanitizeErrorMessage(
        new Error(
          "Invalid `prisma.class_schedule.findMany()` invocation: Unknown column `Foo`",
        ),
      ),
    ).toBe("เกิดข้อผิดพลาดภายในระบบ");
  });

  it("forwards all errors in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");

    const prismaError =
      "Invalid `prisma.teacher.create()` invocation: Unique constraint failed";
    expect(sanitizeErrorMessage(new Error(prismaError))).toBe(prismaError);
  });
});
```

**Step 2: Run the tests**

Run: `pnpm vitest run __test__/lib/error-sanitizer.test.ts`
Expected: All 5 tests pass

**Step 3: Commit**

```bash
git add __test__/lib/error-sanitizer.test.ts
git commit -m "test: add unit tests for error sanitizer"
```

---

### Task 3: Apply Error Sanitizer to action-wrapper and API Routes

**Files:**
- Modify: `src/shared/lib/action-wrapper.ts` — generic error catch (~L240-244)
- Modify: `src/app/api/schedule/validate-drop/route.ts` — catch block (~L271)
- Modify: `src/app/api/schedule/auto-arrange/route.ts` — catch block (~L290)

**Step 1: Modify action-wrapper.ts**

In the generic error catch block (around line 240), replace the raw `error.message`:

```typescript
// Before:
        // Generic error
        return {
          success: false,
          error: {
            message: error.message,
            code: ActionErrorCode.INTERNAL_ERROR,
          },
        };

// After:
        // Generic error — sanitize to prevent leaking Prisma/infra details
        return {
          success: false,
          error: {
            message: sanitizeErrorMessage(error),
            code: ActionErrorCode.INTERNAL_ERROR,
          },
        };
```

Add import at top: `import { sanitizeErrorMessage } from "@/shared/lib/error-sanitizer";`

**Step 2: Modify validate-drop/route.ts**

In the catch block, replace the error field:

```typescript
// Before:
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
        },

// After:
        error: {
          message: sanitizeErrorMessage(error),
        },
```

Add import at top: `import { sanitizeErrorMessage } from "@/shared/lib/error-sanitizer";`

**Step 3: Modify auto-arrange/route.ts**

Same change as validate-drop:

```typescript
// Before:
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
        },

// After:
        error: {
          message: sanitizeErrorMessage(error),
        },
```

Add import at top: `import { sanitizeErrorMessage } from "@/shared/lib/error-sanitizer";`

**Step 4: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 5: Commit**

```bash
git add src/shared/lib/action-wrapper.ts src/app/api/schedule/validate-drop/route.ts src/app/api/schedule/auto-arrange/route.ts
git commit -m "security: apply error sanitizer to action-wrapper and API routes

Prevents leaking Prisma table/column names in production error responses.
Business logic errors (not found, conflict, forbidden) are still forwarded."
```

---

### Task 4: Create Authentication Middleware

**Files:**
- Create: `src/middleware.ts`

**Step 1: Write the middleware**

Uses Better Auth's `getSessionCookie` for optimistic cookie-based checking.
This is NOT full session validation — it only checks if a session cookie exists.
Full auth validation remains in layout guards and per-route handlers.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Public paths that do not require authentication.
 * The (public) route group resolves to / , /teachers/*, /classes/* at the URL level.
 */
const PUBLIC_PATH_PREFIXES = [
  "/signin",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/ping",
  "/api/telemetry",
  "/api/health",
  "/teachers",
  "/classes",
] as const;

const PUBLIC_EXACT_PATHS = new Set(["/"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie (optimistic — not full validation)
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    // API routes: return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Page routes: redirect to signin
    const signinUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, _next internals, and favicon
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "security: add authentication middleware with deny-by-default

Optimistic session cookie check via Better Auth getSessionCookie.
Public allow-list: /, /signin, /forgot-password, /reset-password,
/teachers/*, /classes/*, /api/auth/*, /api/ping, /api/telemetry/*,
/api/health/*. All other routes require a session cookie.
API routes return 401 JSON; page routes redirect to /signin."
```

---

### Task 5: Add Security Headers

**Files:**
- Modify: `next.config.mjs`

**Step 1: Add HSTS, CSP, and Permissions-Policy headers**

Add these three entries to the existing `headers` array in `next.config.mjs`, after the existing four headers:

```javascript
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googleusercontent.com; font-src 'self'; connect-src 'self'; frame-ancestors 'none'",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors (this is a .mjs file, typecheck may not cover it — verify no syntax errors)

**Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "security: add HSTS, CSP, and Permissions-Policy headers

- HSTS: enforce HTTPS with 2-year max-age + preload
- CSP: default-src self, unsafe-inline for Next.js/MUI compatibility
- Permissions-Policy: disable camera, microphone, geolocation"
```

---

### Task 6: Add Admin Role Check to Base Schedule Layout

**Files:**
- Modify: `src/app/schedule/layout.tsx`

**Step 1: Add role check after session check**

```typescript
// Before:
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// After:
import { ReactNode } from "react";
import { redirect, forbidden } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { normalizeAppRole, isAdminRole } from "@/lib/authz";
```

After the `if (!session)` block, add:

```typescript
  // Admin-only access — defense in depth
  // (nested semester layout also checks, but this blocks non-admin discovery of route structure)
  const userRole = normalizeAppRole(session.user?.role);
  if (!isAdminRole(userRole)) {
    forbidden();
  }
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/schedule/layout.tsx
git commit -m "security: add admin role check to base schedule layout

Defense in depth — the nested semester layout already enforces admin-only,
but the parent layout now also blocks non-admin users from discovering
the schedule route structure."
```

---

### Task 7: Lower Auth Rate Limit

**Files:**
- Modify: `src/lib/auth.ts`

**Step 1: Change rate limit max from 50 to 20**

```typescript
// Before:
  rateLimit: {
    enabled: process.env.NODE_ENV === "production" && !process.env.CI,
    window: 60, // 60 second window
    max: 50, // 50 attempts per window in production (increased from 10 for visual testing)
  },

// After:
  rateLimit: {
    enabled: process.env.NODE_ENV === "production" && !process.env.CI,
    window: 60, // 60 second window
    max: 20, // 20 attempts per 60s — tighter brute-force protection
  },
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/auth.ts
git commit -m "security: lower auth rate limit from 50 to 20 per minute"
```

---

### Task 8: Clean Up .env.local.disabled from Git

**Files:**
- Modify: `.gitignore`
- Untrack: `.env.local.disabled`

**Step 1: Add to .gitignore**

Add `.env.local.disabled` to the local env files section, after `.env*.local`:

```gitignore
.env*.local
.env.local.disabled
```

**Step 2: Remove from git tracking (keep the local file)**

```bash
git rm --cached .env.local.disabled
```

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: remove .env.local.disabled from git tracking

File contained placeholder values but sets a bad pattern for secret
management. Added to .gitignore to prevent accidental re-tracking."
```

---

### Task 9: Push All Commits

**Step 1: Push to origin**

```bash
git push origin main
```

Expected: All 8 commits pushed successfully.
