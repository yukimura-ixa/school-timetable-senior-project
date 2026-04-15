import prisma from "@/lib/prisma";
import { cache } from "react";
import type {
  EmailOutboxKind,
  EmailOutboxStatus,
} from "@/prisma/generated/client";

export const emailRepository = {
  /**
   * Find outbox emails with optional filters for status, kind, and text search.
   */
  findOutboxEmails: cache(
    async (filters?: {
      q?: string;
      status?: EmailOutboxStatus;
      kind?: EmailOutboxKind;
    }) => {
      return prisma.emailOutbox.findMany({
        where: {
          ...(filters?.q
            ? {
                OR: [
                  {
                    toEmail: {
                      contains: filters.q,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    subject: {
                      contains: filters.q,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              }
            : {}),
          ...(filters?.status ? { status: filters.status } : {}),
          ...(filters?.kind ? { kind: filters.kind } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    },
  ),

  /**
   * Delete outbox entries whose verification tokens expired more than
   * `graceDays` ago. Used by the daily cleanup cron to keep the table
   * bounded — the verification URL is useless once it expires, so the
   * row is only retained briefly for support/debugging.
   *
   * Not cached: this is a write path called from a scheduled route.
   *
   * @returns count of rows deleted
   */
  async deleteExpiredOutbox(graceDays = 7): Promise<number> {
    const cutoff = new Date(Date.now() - graceDays * 24 * 60 * 60 * 1000);
    const result = await prisma.emailOutbox.deleteMany({
      where: { expiresAt: { lt: cutoff } },
    });
    return result.count;
  },
};
