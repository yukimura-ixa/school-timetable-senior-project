# Email System Status — April 2026

## Decision
Email system is temporarily skipped. No usable mail service available.

**Why:** Brevo (SMTP provider) and AuthJS email integration removed. No replacement service decided yet.

**How to apply:** Do not work on email-related features (#203 email verification). Skip `src/lib/mailer.ts`, `src/lib/auth.ts` mail wiring, and `/management/email-outbox` page until a mail service is chosen.

## Affected Files (abandoned/incomplete on branch claude/onboard-project-g91fw)
- `src/lib/mailer.ts`
- `src/lib/mailer.test.ts`
- `src/lib/auth.ts` (mail wiring)
- `src/app/management/email-outbox/page.tsx`
- `docs/SMTP_SETUP.md`
- `.env.*.example` files (SMTP vars)
