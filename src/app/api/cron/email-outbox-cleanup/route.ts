/**
 * Email Outbox Cleanup Cron
 *
 * Scheduled by Vercel Cron (see vercel.json) to delete expired
 * `email_outbox` rows daily, keeping the table bounded.
 *
 * A row's `verificationUrl` is unusable past `expiresAt`, so we only
 * retain it for a short grace window (default 7 days) for support and
 * audit purposes, then drop it.
 *
 * Addresses acceptance criterion #4 of issue #203.
 *
 * @route GET /api/cron/email-outbox-cleanup
 *
 * Authentication:
 *   - Production (Vercel Cron): Vercel injects `Authorization: Bearer
 *     ${CRON_SECRET}` automatically when CRON_SECRET is set in the
 *     project's env vars. Requests without the header are rejected.
 *   - Local: invoke directly with `curl
 *     http://localhost:3000/api/cron/email-outbox-cleanup` (CRON_SECRET
 *     unset → no auth required, intended for dev only).
 *
 * Returns 200 with `{ deleted: number }` on success.
 */

import { NextResponse, type NextRequest } from "next/server";
import { emailRepository } from "@/features/email/infrastructure/repositories/email.repository";
import { createLogger } from "@/lib/logger";

const log = createLogger("EmailOutboxCleanupCron");

// Disable caching — this is a side-effect endpoint.
export const dynamic = "force-dynamic";

const GRACE_DAYS_DEFAULT = 7;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // When CRON_SECRET is configured, require the Vercel Cron auth header.
  // When unset (local dev), skip the check.
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      log.warn("Unauthorized cron invocation rejected", {
        hasAuthHeader: Boolean(authHeader),
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  // Allow override via ?graceDays=N for ad-hoc cleanups; clamp to a
  // sensible range so a typo can't wipe the table.
  const graceDaysParam = request.nextUrl.searchParams.get("graceDays");
  const graceDays = graceDaysParam
    ? Math.max(1, Math.min(365, Number(graceDaysParam) || GRACE_DAYS_DEFAULT))
    : GRACE_DAYS_DEFAULT;

  try {
    const deleted = await emailRepository.deleteExpiredOutbox(graceDays);

    log.info("Email outbox cleanup completed", { deleted, graceDays });

    return NextResponse.json(
      {
        ok: true,
        deleted,
        graceDays,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    log.logError(error, { route: "cron/email-outbox-cleanup", graceDays });

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
