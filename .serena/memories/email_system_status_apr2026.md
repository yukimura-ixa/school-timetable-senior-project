# Email System Status — REMOVED (May 2026)

## Decision
Email system **removed entirely** on 2026-05-26 (bd issue `school-timetable-senior-project-atf`). No mail server is available and none is planned.

**Why:** No usable mail service (Brevo/AuthJS/ACS all abandoned). Rather than keep dead-but-wired email code, it was deleted.

## What was removed
- `src/lib/mailer.ts` + `src/lib/mailer.test.ts` (Azure Communication Services sender)
- `@azure/communication-email` dependency (package.json)
- `src/features/email/` (outbox repository)
- `src/app/management/email-outbox/` (admin UI) and `src/app/api/cron/email-outbox-cleanup/` (cron)
- better-auth email wiring in `src/lib/auth.ts`: `sendResetPassword`, `emailVerification`, `user.changeEmail`, and all `prisma.emailOutbox.*` calls + the `redactVerificationUrlForOutbox` helper
- `EmailOutbox` table + `EmailOutboxKind`/`EmailOutboxStatus` enums — dropped via migration `prisma/migrations/20260526120000_remove_email_outbox`
- ACS/SMTP env vars and the Vercel Cron section from `.env.*.example`; `docs/SMTP_SETUP.md`

## What was KEPT
- **Email/password login** (`emailAndPassword.enabled: true`) — login needs no mail server. Forgotten passwords are reset by an admin via the better-auth admin plugin.
- Google OAuth, admin plugin, rate limiting.

## Side fix
Regenerating the Prisma client (gitignored, so it was stale) exposed that `schema.prisma`'s `breaktime` enum had been pruned to `BREAK, NOT_BREAK`. Corrected to match the DB (`0_init`): `BREAK_JUNIOR, BREAK_SENIOR, BREAK_BOTH, NOT_BREAK, BREAK`.

## Residual / watch
- better-auth `Verification` model is still absent from `schema.prisma` though a `verification` table exists in the DB. Harmless now (all token flows removed). Re-add the model if any token-based better-auth flow is reintroduced.
- If re-enabling email later: re-add a mailer, the `sendResetPassword`/`emailVerification` handlers, and an outbox model if a queue is wanted.
