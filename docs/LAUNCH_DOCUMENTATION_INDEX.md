# Launch Documentation Index

> **Slimmed 2026-06-24 (kcx).** This index had drifted — it asserted a frozen status
> ("A- grade / 125 TS errors / 7 migrations / 30-minute launch", dated 2025-12-07) and linked to
> documents that no longer exist (`SECURITY_CODE_REVIEW_2025-12-07.md`,
> `SECURITY_IMPROVEMENTS_IMPLEMENTATION.md`, `DEPLOYMENT_GUIDE.md`, `DEVELOPMENT_GUIDE.md`,
> `PROJECT_CONTEXT.md`, `DATABASE_OVERVIEW.md`, `TEST_PLAN.md`). Rather than re-freeze stale numbers,
> this is now a thin pointer to the canonical sources.

## Canonical launch reference

- **[`PRODUCTION_LAUNCH_GUIDE.md`](./PRODUCTION_LAUNCH_GUIDE.md)** — the launch runbook: pre-flight →
  go/no-go → execute → validate, with gates, rollback, and troubleshooting.

## Security

- **[`SECURITY_REVIEW_SUMMARY.md`](./SECURITY_REVIEW_SUMMARY.md)** — security review summary (the only
  security doc that currently exists).

## Notes

- Do not rely on the previously-listed security/deployment/architecture docs or the frozen
  grade/migration/TS-error counts — they were removed or never existed.
- For current quality status, run the live gates (`pnpm typecheck`, `pnpm lint`, `pnpm build`, CI)
  rather than trusting a snapshot in a doc.
