# Production Launch & Operations Guide

**Canonical deployment doc.** Reconciled from the former `PRE_LAUNCH_CHECKLIST.md` (deleted) and the prior version of this file. Treat every status line below as *something to verify*, not a frozen "ready" assertion — the old docs rotted precisely because they asserted a fixed state while the code moved.

- **Last reconciled:** 2026-06-20
- **Production domain:** https://phrasongsa-timetable.vercel.app
- **Repo:** https://github.com/yukimura-ixa/school-timetable-senior-project
- **Hosting:** Vercel (team `yukimura-ixas-projects`, project `phrasongsa-timetable`)
- **Stack:** Next.js 16 (App Router, React Compiler) · Prisma 7 + Prisma Postgres/Accelerate · better-auth (email/password + Google OAuth)

---

## Open issues to triage before launch

These are tracked in beads (`bd show <id>`) and are production-relevant. Decide go/no-go on each before deploying to a live school:

| ID | Pri | Summary |
|----|-----|---------|
| `school-timetable-senior-project-4ke` | P1 | Session cookies not forwarded as `Secure` for headless PDF render under prod HTTPS — PDF export may fail in production |
| `school-timetable-senior-project-5ka` | P2 | Public routes serve unpublished terms (no `PUBLISHED` filter) — data exposure |
| `school-timetable-senior-project-b4w` | P2 | Headless PDF render not wrapped in try/catch in the 4 print `pdf/route.ts` handlers |
| `school-timetable-senior-project-ttm` | P3 | Teacher persona cannot log in (signin UI is admin-only, dashboard layout 403s non-admin) |

Run `bd ready` for the current list.

---

## Deployment checklist

Ordered by what actually breaks *this* stack, not generic git hygiene.

### 0. Pre-flight
- [ ] Deploying a **CI-green commit** — `ci.yml` (lint, typecheck, vitest, build) **and** `e2e-tests.yml` (sharded Playwright) passed on the exact SHA going to prod.
- [ ] On `main`, synced with `origin`, working tree clean (`git status`).

### 1. Database & migrations (the real gotcha)
Migrations are **not** in the repo's default deploy path: `vercel.json` has no build command, and `postinstall` only runs `prisma generate`. So `prisma migrate deploy` runs only if it was added to the build command in the Vercel dashboard.

The `datasource db` block in `prisma/schema.prisma` declares no `url` (Prisma 7 driver-adapter setup), so the Prisma CLI takes the connection from the `DATABASE_URL` environment variable. In production that variable is the direct `db.prisma.io:5432` connection, so migrations hit the right endpoint by default — just confirm `DATABASE_URL` is the direct connection and not pointed at the Accelerate proxy (`PRISMA_DATABASE_URL`), which can't run migrations.

- [ ] **Check the Vercel Build Command** (Dashboard → Settings → Build & Development Settings). If it's the default `next build`, migrations are **manual** — you must run them yourself. If it's `prisma migrate deploy && next build`, they're automated.
- [ ] **Back up before migrating:** `pnpm exec tsx scripts/db-backup.ts` → writes JSON to `backups/`.
- [ ] If manual, run `prisma migrate deploy` with `DATABASE_URL` set to the direct `db.prisma.io` connection.
- [ ] `prisma migrate status` shows zero pending after deploy.

### 2. Auth & domain config (most common better-auth prod break)
- [ ] `NEXT_PUBLIC_AUTH_URL` in Vercel matches the prod domain (`https://phrasongsa-timetable.vercel.app/`).
- [ ] Google OAuth **authorized redirect URIs** (Google Cloud console) include the prod callback for that domain — otherwise Google sign-in 400s.
- [ ] Vercel env has `BETTER_AUTH_SECRET` set. The code reads `BETTER_AUTH_SECRET`, **not** `AUTH_SECRET`.
- [ ] No dev-bypass flag (`ENABLE_DEV_BYPASS` or similar) set in production.

### 3. Deploy
- [ ] **Confirm the deploy trigger.** The assumed mechanism is push-to-`main` auto-deploying via Vercel's Git integration. Verify that's wired; otherwise deploy via the dashboard or `vercel --prod`.
- [ ] Watch build logs to green / "Ready".

### 4. Post-deploy validation
Only these health endpoints exist — `/api/health` and `/api/health/full` do **not**:
- [ ] `curl https://phrasongsa-timetable.vercel.app/api/health/db` → DB-ready JSON.
- [ ] `curl https://phrasongsa-timetable.vercel.app/api/ping` → ok.
- [ ] Homepage and sign-in load; admin can log in and reach the dashboard.
- [ ] **PDF / timetable export works.** It uses `@sparticuz/chromium` + `puppeteer-core` in a serverless function. No route sets `maxDuration`, and the project is on the **Hobby plan** — watch for function-duration limits on chromium cold start, and see blocker `-4ke` (Secure cookies) which can break this entirely under prod HTTPS.

### 5. First-launch only — create admin
`pnpm admin:seed:prod` (idempotent). With the prod direct `DATABASE_URL` set:
- Email: `ADMIN_EMAIL` env, else default `admin@school.local`.
- Password: `SEED_ADMIN_PASSWORD`, else `ADMIN_PASSWORD`, else the fallback `admin123`.
- [ ] **Set `SEED_ADMIN_PASSWORD` explicitly** — never let it fall back to `admin123` in production.
- [ ] Change the password immediately after first login.

---

## Emergency rollback runbook

```
Issue detected
   ├─ UI/code bug only? ───────────────> App rollback        (< 5 min)
   ├─ Data corruption? ────────────────> Database restore    (15–30 min)
   └─ Code + DB schema together? ──────> Full revert         (30–60 min)
```

### A. Application rollback (< 5 min) — code-only, no schema change
1. Vercel Dashboard → `phrasongsa-timetable` → Deployments.
2. Find the last green deployment → **Promote to Production**.
3. Wait ~30s, then verify: `curl https://phrasongsa-timetable.vercel.app/api/health/db`.

CLI alternative: `vercel rollback <deployment-url>` (requires Vercel CLI installed and project linked).

### B. Database restore (15–30 min) — data corruption / bad migration
Requires Prisma Postgres backups to be enabled.
1. Optionally pause traffic.
2. Prisma Console (https://console.prisma.io) → your database → **Backups**.
3. Select the backup from before the incident → **Restore** → confirm.
4. Verify: `curl https://phrasongsa-timetable.vercel.app/api/health/db`.
5. If schema was reverted, redeploy the matching app version.

> A restore affects every environment pointing at this database, including preview deployments. Coordinate with the team first.

### C. Full revert (30–60 min) — code + schema together
1. `git revert <bad-commit>` (or a range), push to `main`.
2. If schema changed, restore the DB (Option B) timed to complete before the reverted code redeploys.
3. Verify health endpoint + a manual smoke pass (login, timetable loads, export).

### Pre-deploy backup (always, before destructive migrations)
```bash
pnpm exec tsx scripts/db-backup.ts   # → backups/backup-<timestamp>.json
```

---

## Operations

### Monitoring
- **Vercel runtime logs** — primary error signal (`vercel logs` or the dashboard).
- **Vercel Analytics + Speed Insights** — installed (`@vercel/analytics`, `@vercel/speed-insights`); Core Web Vitals appear after ~24h of traffic.
- **No external error tracking.** The dead `SENTRY_*` env vars were removed; `@sentry/*` is only a transitive lockfile dependency and `src/instrumentation.ts` is an empty `register()` stub — nothing reports to Sentry. Adding real error tracking (Sentry or Vercel Agent) is roadmap work, not configured. The current prod error signal is Vercel runtime logs.

### Cadence
- **Daily:** `pnpm exec tsx scripts/db-backup.ts`; glance at Vercel logs for errors.
- **Weekly:** review CI results, confirm a recent backup exists, check deployment metrics.
- **Monthly:** audit user accounts/permissions, rotate secrets, apply dependency security patches.

### Incident — admin lost / password forgotten
`admin:seed:prod` is idempotent; re-run it with the prod `DATABASE_URL` set, then reset the password via the admin dashboard.

---

## Git workflow

1. Branch from `main`, make changes, run `pnpm test` and `pnpm build` locally.
2. Push the branch, open a PR; wait for CI + E2E green and review.
3. Merge to `main` → Vercel deploys (confirm the auto-deploy trigger per checklist §3).
4. Roll back via the runbook above if needed.

## Useful commands
```bash
pnpm exec tsx scripts/db-backup.ts   # backup prod DB (needs DATABASE_URL)
pnpm admin:seed:prod                 # create/repair prod admin (needs DATABASE_URL)
pnpm prisma migrate status           # check pending migrations
pnpm prisma migrate deploy           # apply migrations (direct DATABASE_URL only)
pnpm typecheck && pnpm lint          # local quality gates
```

## Related
- Security summary: `docs/SECURITY_REVIEW_SUMMARY.md`
- MOE compliance: `docs/agents/instructions/moe-and-identifiers.md`
- Agent contract: `AGENTS.md`
