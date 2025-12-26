# SBTM Exploratory Testing Session Report

**Session Date:** 2025-12-24
**Tester:** Antigravity Agent
**Environment:** Production (https://phrasongsa-timetable.vercel.app)
**Duration:** 30 minutes (Continuation session)
**Focus:** Bug investigation for BUG-26 & BUG-27

---

## Session Charter

**Mission:** Investigate root causes of blocking bugs from previous session.
**Status:** � INVESTIGATION COMPLETE - Awaiting fixes

---

## Bug Summary (Updated)

### 🔴 P0 - Critical

| ID         | Bug                            | Root Cause                                                                | Fix Required                   |
| ---------- | ------------------------------ | ------------------------------------------------------------------------- | ------------------------------ |
| **BUG-26** | **Production Login 500 Error** | Server-side crash. Auth config valid in code. Likely Vercel env/DB issue. | Check Vercel env vars & DB URL |

### 🟠 P1 - High

| ID         | Bug                             | Root Cause                                                                                             | Fix Required       |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------ |
| **BUG-27** | **Public Teacher Schedule 404** | **Stale deployment.** Current code: `/teachers/607/${configId}`. Production shows: `/teachers/1-2567`. | Redeploy to Vercel |

---

## Investigation Details

### BUG-26: Login 500 Error (P0 Critical)

**Verified:** 2025-12-24 15:25 ICT

1. Attempted login with `admin@school.local` / `admin123`
2. Console output:
   ```
   [ERROR] Failed to load resource: status 500
   [ERROR] [SignInForm] Authentication failed {error: undefined}
   ```
3. **Code Review:**
   - `src/lib/auth.ts` - Better Auth config looks correct
   - Database adapter: Prisma + PostgreSQL
   - Env vars checked: `BETTER_AUTH_SECRET`, `AUTH_URL`, `VERCEL_URL` all referenced
   - Rate limiting: Enabled in production (50/min)

**Diagnosis:** Server-side crash before response. Not a client-side code issue. Must check:

- Vercel runtime logs for actual error
- `BETTER_AUTH_SECRET` or `AUTH_SECRET` env var presence
- `DATABASE_URL` connectivity to Vercel Postgres

### BUG-27: Teacher Schedule 404 (P1 High)

**Verified:** 2025-12-24 15:25 ICT

1. Homepage link shows: `/teachers/1-2567` (404)
2. **Code Review:**
   - `src/app/(public)/page.tsx` line 110: `href={/teachers/607/${currentConfigId}}`
   - Expected URL: `/teachers/607/2567/1`
   - Production URL: `/teachers/1-2567` (missing teacher ID `607`)

**Diagnosis:** **Production deployment is stale.** The fix to include teacher ID `607` in the URL was made in the codebase but not deployed.

---

## Action Items

1. **[IMMEDIATE] Check Vercel Logs for BUG-26:**

   ```
   vercel logs --filter="500" --app=phrasongsa-timetable
   ```

   Or use Vercel Dashboard → Functions → Logs

2. **[IMMEDIATE] Verify Env Vars:**
   - `BETTER_AUTH_SECRET` or `AUTH_SECRET`
   - `DATABASE_URL` (Vercel Postgres connection string)
   - `AUTH_URL` or `NEXTAUTH_URL`

3. **[FIX] Redeploy for BUG-27:**
   Push latest code to trigger Vercel deployment. The fix for the homepage link already exists in codebase.

4. **[RESUME TESTING]:**
   Once login works, continue with Admin charter tests.

---

_Generated: 2025-12-24_
