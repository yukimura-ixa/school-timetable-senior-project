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
};
