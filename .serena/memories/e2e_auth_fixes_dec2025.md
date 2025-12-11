# E2E Auth Flow Fixes - December 2025

## Problem
E2E tests were failing in dev mode due to:
1. Next.js Fast Refresh interfering with client-side navigation after signin
2. Dev server compilation taking 25-30s per route
3. Timeout values too short for dev mode page compilation

## Root Causes
1. **Fast Refresh Interference**: After `authClient.signIn.email()` succeeded, the SignInForm would call `window.location.href = "/dashboard"`, but Fast Refresh would re-mount the component before navigation completed, effectively cancelling the redirect.

2. **Slow Dev Compilation**: Routes like `/api/auth/[...all]`, `/dashboard`, `/schedule/[semesterAndyear]/lock` each took 20-35s to compile on first access.

3. **Insufficient Timeouts**: Default 30s test timeout and 20s navigation timeout weren't enough.

## Solutions Applied

### 1. SignInForm.tsx
- Changed from `router.push("/dashboard")` to `window.location.href = "/dashboard"`
- Added session verification loop (10 attempts × 200ms) before navigation
- This ensures cookies are properly set and recognized before redirect

### 2. auth.setup.ts
- Increased setup timeout from 60s to 180s
- Added robust navigation detection:
  - Wait for either URL change OR auth cookies to be set
  - If cookies detected but URL doesn't change (Fast Refresh interference), manually navigate using `page.goto()`
- Added progress logging every 10s during wait
- Added fallback: try manual navigation if both conditions fail

### 3. playwright.config.ts
- Added conditional test timeout: `timeout: process.env.CI ? 30000 : 60000`
- Increased `actionTimeout` from 10000 to 15000
- Increased `navigationTimeout` from 20000 to 60000

### 4. admin.fixture.ts
- Added explicit 60s timeout to `page.goto()`
- Changed `waitForLoadState("networkidle")` to `waitForLoadState("domcontentloaded", { timeout: 30000 })`

## Verification
- Auth setup now passes consistently (~1.5-2 minutes in dev mode)
- Individual tests pass when the page route is already compiled (~40-50s first time)
- CI mode (production build) is unaffected - uses `next start` which is fast

## Remaining Issues
Some bulk lock tests still fail due to UI element timing issues (checkboxes not ready within timeout). These are separate from auth - the selectors need explicit waits for modal content to render.

## Key Insight
In Next.js dev mode with Turbopack, Fast Refresh can interrupt navigation. The solution is to:
1. Verify session cookies are set before attempting navigation
2. Have a fallback mechanism (manual page.goto) when client-side navigation fails
3. Use longer timeouts that account for route compilation time
